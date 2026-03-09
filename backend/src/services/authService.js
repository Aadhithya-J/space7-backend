const bcrypt = require('bcrypt');
const { User } = require('../models');
const redis = require('../config/redis');
const generateOTP = require('../utils/generateOTP');
const { signToken } = require('../utils/jwt');
const emailQueue = require('../queues/emailQueue');

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS) || 300;

class AuthService {
    /**
     * Register a new user. Stores user (unverified) and sends OTP via email.
     */
    async signup({ username, email, password }) {
        const existing = await User.findOne({ where: { email } });
        if (existing && existing.is_verified) {
            throw Object.assign(new Error('Email already registered'), { status: 409 });
        }

        // If user exists but is unverified, delete and re-create
        if (existing && !existing.is_verified) {
            await existing.destroy();
        }

        const password_hash = await bcrypt.hash(password, 12);
        const user = await User.create({ username, email, password_hash });

        // Generate OTP and store in Redis
        const otp = generateOTP();
        await redis.set(`otp:${email}`, otp, 'EX', OTP_EXPIRY);

        // Queue verification email (non-fatal if email service is unavailable)
        try {
            await emailQueue.add('send-otp', {
                to: email,
                subject: 'space7 — Verify your email',
                html: `<h2>Welcome to space7!</h2><p>Your verification code is: <strong>${otp}</strong></p><p>This code expires in ${OTP_EXPIRY / 60} minutes.</p>`,
            });
        } catch (emailErr) {
            console.error('⚠️ Failed to queue verification email:', emailErr.message);
        }

        return { user_id: user.user_id, email: user.email };
    }

    /**
     * Verify OTP for email confirmation.
     */
    async verifyOTP({ email, otp }) {
        const storedOTP = await redis.get(`otp:${email}`);
        if (!storedOTP) {
            throw Object.assign(new Error('OTP expired or not found'), { status: 400 });
        }
        if (storedOTP !== otp) {
            throw Object.assign(new Error('Invalid OTP'), { status: 400 });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw Object.assign(new Error('User not found'), { status: 404 });
        }

        user.is_verified = true;
        await user.save();
        await redis.del(`otp:${email}`);

        const token = signToken({ user_id: user.user_id, email: user.email });

        return { token, user: { user_id: user.user_id, username: user.username, email: user.email } };
    }

    /**
     * Login with email and password.
     */
    async login({ email, password }) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw Object.assign(new Error('Invalid credentials'), { status: 401 });
        }
        if (!user.is_verified) {
            throw Object.assign(new Error('Email not verified'), { status: 403 });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            throw Object.assign(new Error('Invalid credentials'), { status: 401 });
        }

        const token = signToken({ user_id: user.user_id, email: user.email });

        return {
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profile_picture: user.profile_picture,
            },
        };
    }

    /**
     * Send OTP for password reset.
     */
    async forgotPassword({ email }) {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw Object.assign(new Error('No account with that email'), { status: 404 });
        }

        const otp = generateOTP();
        await redis.set(`otp:reset:${email}`, otp, 'EX', OTP_EXPIRY);

        await emailQueue.add('send-reset-otp', {
            to: email,
            subject: 'space7 — Password Reset',
            html: `<h2>Password Reset</h2><p>Your reset code is: <strong>${otp}</strong></p><p>This code expires in ${OTP_EXPIRY / 60} minutes.</p>`,
        });

        return { message: 'Reset OTP sent to your email' };
    }

    /**
     * Reset password using OTP.
     */
    async resetPassword({ email, otp, newPassword }) {
        const storedOTP = await redis.get(`otp:reset:${email}`);
        if (!storedOTP || storedOTP !== otp) {
            throw Object.assign(new Error('Invalid or expired OTP'), { status: 400 });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            throw Object.assign(new Error('User not found'), { status: 404 });
        }

        user.password_hash = await bcrypt.hash(newPassword, 12);
        await user.save();
        await redis.del(`otp:reset:${email}`);

        return { message: 'Password updated successfully' };
    }
}

module.exports = new AuthService();

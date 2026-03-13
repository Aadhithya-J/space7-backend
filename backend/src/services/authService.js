const bcrypt = require('bcrypt');
const { User } = require('../models');
const redis = require('../config/redis');
const generateOTP = require('../utils/generateOTP');
const { signToken } = require('../utils/jwt');
const emailQueue = require('../queues/emailQueue');

const OTP_EXPIRY = parseInt(process.env.OTP_EXPIRY_SECONDS) || 300;
const REDIS_OPERATION_TIMEOUT = 8000;

function withTimeout(promise, label) {
    return Promise.race([
        promise,
        new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`${label} timed out`));
            }, REDIS_OPERATION_TIMEOUT);
        }),
    ]);
}

class AuthService {

    /**
     * Register a new user.
     * Stores signup data + OTP together in Redis and sends OTP via email.
     */
    async signup({ username, email, password }) {

        const existing = await User.findOne({ where: { email } });

        if (existing && existing.is_verified) {
            throw Object.assign(
                new Error('This email is already associated with an account'),
                { status: 409 }
            );
        }

        const password_hash = await bcrypt.hash(password, 12);
        const otp = generateOTP();

        try {

            // Ensure Redis connection is alive (prevents EPIPE)
            await withTimeout(redis.ping(), 'Redis ping');

            // Store signup data + OTP in ONE key
            await withTimeout(
                redis.set(
                    `signup:${email}`,
                    JSON.stringify({
                        username,
                        email,
                        password_hash,
                        otp
                    }),
                    'EX',
                    OTP_EXPIRY
                ),
                'Redis signup write'
            );

        } catch (redisErr) {
            console.error('Redis write failed:', redisErr.message);

            throw Object.assign(
                new Error('Temporary server issue. Please try again.'),
                { status: 500 }
            );
        }

        // Queue email
        try {

            await emailQueue.add('send-otp', {
                to: email,
                subject: 'space7 — Verify your email',
                html: `
                    <h2>Welcome to space7!</h2>
                    <p>Your verification code is: <strong>${otp}</strong></p>
                    <p>This code expires in ${OTP_EXPIRY / 60} minutes.</p>
                `
            });

        } catch (emailErr) {

            console.error(
                '⚠️ Failed to queue verification email:',
                emailErr.message
            );

        }

    
                return {
            message: 'A verification code has been sent to your email',
            email
        };    }



    /**
     * Verify OTP and create the user.
     */
    async verifyOTP({ email, otp }) {

        const signupData = await withTimeout(
            redis.get(`signup:${email}`),
            'Redis signup read'
        );

        if (!signupData) {
            throw Object.assign(
                new Error('Your signup session has expired. Please register again'),
                { status: 400 }
            );
        }

        const parsed = JSON.parse(signupData);

        const {
            username,
            password_hash,
            otp: storedOTP
        } = parsed;

        if (String(storedOTP) !== String(otp)) {
            throw Object.assign(
                new Error('The verification code you entered is incorrect'),
                { status: 400 }
            );
        }

        const user = await User.create({
            username,
            email,
            password_hash,
            is_verified: true
        });

        await withTimeout(
            redis.del(`signup:${email}`),
            'Redis signup cleanup'
        );

        const token = signToken({
            user_id: user.user_id,
            email: user.email
        });

        return {
            message: 'Email verified successfully! Welcome to space7',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email
            }
        };
    }


    /**
     * Login with email and password.
     */
    async login({ email, password }) {

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw Object.assign(
                new Error('The email or password you entered is incorrect'),
                { status: 401 }
            );
        }

        if (!user.is_verified) {
            throw Object.assign(
                new Error('Please verify your email address before signing in'),
                { status: 403 }
            );
        }

        const valid = await bcrypt.compare(password, user.password_hash);

        if (!valid) {
            throw Object.assign(
                new Error('The email or password you entered is incorrect'),
                { status: 401 }
            );
        }

        const token = signToken({
            user_id: user.user_id,
            email: user.email
        });

        return {
            message: 'Signed in successfully',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                bio: user.bio,
                profile_picture: user.profile_picture
            }
        };
    }


    /**
     * Send OTP for password reset.
     */
    async forgotPassword({ email }) {

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw Object.assign(
                new Error("We couldn't find an account with that email address"),
                { status: 404 }
            );
        }

        const otp = generateOTP();

        await withTimeout(
            redis.set(
                `otp:reset:${email}`,
                otp,
                'EX',
                OTP_EXPIRY
            ),
            'Redis reset OTP write'
        );

        await emailQueue.add('send-reset-otp', {
            to: email,
            subject: 'space7 — Password Reset',
            html: `
                <h2>Password Reset</h2>
                <p>Your reset code is: <strong>${otp}</strong></p>
                <p>This code expires in ${OTP_EXPIRY / 60} minutes.</p>
            `
        });

        return {
            message: 'A password reset code has been sent to your email'
        };
    }


    /**
     * Reset password using OTP.
     */
    async resetPassword({ email, otp, newPassword }) {

        const storedOTP = await withTimeout(
            redis.get(`otp:reset:${email}`),
            'Redis reset OTP read'
        );

        if (!storedOTP || String(storedOTP) !== String(otp)) {
            throw Object.assign(
                new Error('The reset code you entered is invalid or has expired'),
                { status: 400 }
            );
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            throw Object.assign(
                new Error("We couldn't find an account with that email address"),
                { status: 404 }
            );
        }

        user.password_hash = await bcrypt.hash(newPassword, 12);

        await user.save();

        await withTimeout(
            redis.del(`otp:reset:${email}`),
            'Redis reset OTP cleanup'
        );

        return {
            message: 'Your password has been updated successfully'
        };
    }
}

module.exports = new AuthService();

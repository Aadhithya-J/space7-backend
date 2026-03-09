const authService = require('../services/authService');

class AuthController {
    async signup(req, res, next) {
        try {
            const result = await authService.signup(req.body);
            res.status(201).json({ message: 'OTP sent to your email', ...result });
        } catch (err) {
            next(err);
        }
    }

    async verifyOTP(req, res, next) {
        try {
            const result = await authService.verifyOTP(req.body);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async login(req, res, next) {
        try {
            const result = await authService.login(req.body);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async forgotPassword(req, res, next) {
        try {
            const result = await authService.forgotPassword(req.body);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }

    async resetPassword(req, res, next) {
        try {
            const result = await authService.resetPassword(req.body);
            res.json(result);
        } catch (err) {
            next(err);
        }
    }
}

module.exports = new AuthController();

const Joi = require('joi');

const signupSchema = Joi.object({
    username: Joi.string().min(3).max(50).required(),
    email: Joi.string().trim().lowercase().email().required(),
    password: Joi.string().min(6).max(128).required(),
});

const verifyOtpSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    otp: Joi.string().length(6).required(),
});

const loginSchema = Joi.object({
    identifier: Joi.string().trim(),
    email: Joi.string().trim().lowercase().email(),
    password: Joi.string().required(),
}).or('identifier', 'email');

const forgotPasswordSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
});

const resetPasswordSchema = Joi.object({
    email: Joi.string().trim().lowercase().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(6).max(128).required(),
});

module.exports = {
    signupSchema,
    verifyOtpSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
};

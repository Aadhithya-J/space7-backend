const Joi = require('joi');

const createSpaceSchema = Joi.object({
    title: Joi.string().min(3).max(200).required(),
    description: Joi.string().min(10).required(),
    visibility: Joi.string().valid('public', 'private').default('public'),
    hashtags: Joi.array().items(Joi.string().max(50)).max(10).default([]),
});

const joinSpaceSchema = Joi.object({
    invite_code: Joi.string().optional(),
});

module.exports = {
    createSpaceSchema,
    joinSpaceSchema,
};

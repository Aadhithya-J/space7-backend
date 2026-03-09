const Joi = require('joi');

const sendMessageSchema = Joi.object({
    content: Joi.string().max(5000).optional().allow('', null),
    media_type: Joi.string().valid('image', 'video', 'audio').optional().allow(null),
});

module.exports = {
    sendMessageSchema,
};

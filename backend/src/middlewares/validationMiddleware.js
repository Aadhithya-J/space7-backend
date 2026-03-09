/**
 * Returns an Express middleware that validates req.body against a Joi schema.
 */
function validate(schema) {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            return res.status(400).json({
                error: 'Validation error',
                details: error.details.map((d) => d.message),
            });
        }
        req.body = value;
        next();
    };
}

module.exports = validate;

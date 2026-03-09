function notFoundHandler(req, res, _next) {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
}

function errorHandler(err, _req, res, _next) {
    console.error('Error:', err);

    // Joi validation error
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Validation error',
            details: err.details.map((d) => d.message),
        });
    }

    // Sequelize validation error
    if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
            error: 'Validation error',
            details: err.errors.map((e) => e.message),
        });
    }

    const status = err.status || 500;
    res.status(status).json({
        error: err.message || 'Internal server error',
    });
}

module.exports = { notFoundHandler, errorHandler };

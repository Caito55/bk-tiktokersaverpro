const logger = require('../utils/logger');

class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    }
}

const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Log el error
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method
    });

    // Errores de validación
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'fail',
            message: 'Error de validación',
            errors: err.details.map(detail => detail.message)
        });
    }

    // Error de rate limit
    if (err.name === 'RateLimitError') {
        return res.status(429).json({
            status: 'fail',
            message: 'Demasiadas solicitudes. Por favor, intente más tarde.'
        });
    }

    // Error de TikTok
    if (err.name === 'TikTokError') {
        return res.status(503).json({
            status: 'error',
            message: 'Error al procesar el video de TikTok'
        });
    }

    // Error genérico para producción
    if (process.env.NODE_ENV === 'production') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // Error con detalles para desarrollo
    return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack,
        error: err
    });
};

module.exports = {
    ApiError,
    errorHandler
};
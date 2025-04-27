const express = require('express');
const router = express.Router();
const Joi = require('joi');
const { processVideo, downloadVideo } = require('../services/tiktokService');
const { ApiError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

// Esquemas de validación
const schemas = {
    processUrl: Joi.object({
        url: Joi.string()
            .required()
            .pattern(/^https?:\/\/(www\.)?(vm\.)?(tiktok\.com)/)
            .message('URL de TikTok inválida')
    }),
    
    download: Joi.object({
        videoId: Joi.string()
            .required()
            .min(5)
            .message('ID de video inválido'),
        quality: Joi.string()
            .valid('high', 'medium', 'low')
            .default('high')
    })
};

// Middleware de validación
const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body);
        if (error) {
            throw new ApiError(400, error.details[0].message);
        }
        next();
    };
};

// Ruta para procesar URL de TikTok
router.post('/process', validate(schemas.processUrl), async (req, res, next) => {
    try {
        const { url } = req.body;
        const videoData = await processVideo(url);
        res.json({
            status: 'success',
            data: videoData
        });
    } catch (error) {
        next(error);
    }
});

// Ruta para descargar video
router.post('/download', validate(schemas.download), async (req, res, next) => {
    try {
        const { videoId, quality } = req.body;
        const downloadUrl = await downloadVideo(videoId, quality);
        res.json({
            status: 'success',
            data: {
                downloadUrl
            }
        });
    } catch (error) {
        next(error);
    }
});

// Ruta de healthcheck
router.get('/health', (req, res) => {
    res.json({
        status: 'success',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
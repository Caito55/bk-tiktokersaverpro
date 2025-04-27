const TikTokScraper = require('tiktok-scraper');
const redisClient = require('../config/redis');
const logger = require('../utils/logger');
const { ApiError } = require('../middleware/errorHandler');

// Cache TTL en segundos
const CACHE_TTL = {
    METADATA: 3600, // 1 hora
    DOWNLOAD_URL: 300 // 5 minutos
};

class TiktokService {
    /**
     * Procesa una URL de TikTok y extrae sus metadatos
     */
    async processVideo(url) {
        try {
            // Generar clave de caché basada en la URL
            const cacheKey = `metadata:${this._normalizeUrl(url)}`;
            
            // Intentar obtener datos del caché
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                logger.info('Datos obtenidos desde caché:', { url });
                return cachedData;
            }

            // Obtener metadatos del video
            const videoData = await TikTokScraper.getVideoMeta(url);
            
            if (!videoData || !videoData.collector || !videoData.collector[0]) {
                throw new ApiError(404, 'No se pudo obtener información del video');
            }

            const metadata = {
                id: videoData.collector[0].id,
                desc: videoData.collector[0].desc,
                author: videoData.collector[0].authorMeta.name,
                duration: videoData.collector[0].videoMeta.duration,
                thumbnail: videoData.collector[0].imageUrl,
                stats: {
                    plays: videoData.collector[0].playCount,
                    shares: videoData.collector[0].shareCount,
                    comments: videoData.collector[0].commentCount,
                    likes: videoData.collector[0].diggCount
                }
            };

            // Guardar en caché
            await redisClient.set(cacheKey, metadata, CACHE_TTL.METADATA);

            return metadata;

        } catch (error) {
            logger.error('Error al procesar video:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Error al procesar el video de TikTok');
        }
    }

    /**
     * Obtiene la URL de descarga para un video específico
     */
    async downloadVideo(videoId, quality = 'high') {
        try {
            const cacheKey = `download:${videoId}:${quality}`;
            
            // Intentar obtener URL del caché
            const cachedUrl = await redisClient.get(cacheKey);
            if (cachedUrl) {
                logger.info('URL de descarga obtenida desde caché:', { videoId, quality });
                return cachedUrl;
            }

            // Obtener URLs del video
            const videoData = await TikTokScraper.getVideoMeta(`https://www.tiktok.com/@user/video/${videoId}`);
            
            if (!videoData || !videoData.collector || !videoData.collector[0]) {
                throw new ApiError(404, 'Video no encontrado');
            }

            let downloadUrl;
            const videoUrls = videoData.collector[0].videoUrl;

            // Seleccionar URL según calidad solicitada
            switch (quality) {
                case 'high':
                    downloadUrl = videoUrls;
                    break;
                case 'medium':
                    downloadUrl = videoData.collector[0].videoUrlNoWaterMark || videoUrls;
                    break;
                case 'low':
                    downloadUrl = videoData.collector[0].videoUrlNoWaterMark || videoUrls;
                    break;
                default:
                    downloadUrl = videoUrls;
            }

            if (!downloadUrl) {
                throw new ApiError(404, 'No se encontró URL de descarga para la calidad solicitada');
            }

            // Guardar en caché
            await redisClient.set(cacheKey, downloadUrl, CACHE_TTL.DOWNLOAD_URL);

            return downloadUrl;

        } catch (error) {
            logger.error('Error al obtener URL de descarga:', error);
            if (error instanceof ApiError) throw error;
            throw new ApiError(500, 'Error al obtener la URL de descarga');
        }
    }

    /**
     * Normaliza una URL de TikTok para uso en caché
     */
    _normalizeUrl(url) {
        try {
            const urlObj = new URL(url);
            // Eliminar parámetros de query innecesarios
            urlObj.search = '';
            return urlObj.toString();
        } catch (error) {
            return url;
        }
    }
}

module.exports = new TiktokService();
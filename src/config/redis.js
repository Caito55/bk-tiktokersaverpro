const Redis = require('redis');
const logger = require('../utils/logger');

class RedisClient {
    constructor() {
        this.client = null;
        this.connected = false;
    }

    async connect() {
        try {
            this.client = Redis.createClient({
                url: process.env.REDIS_URL || 'redis://localhost:6379',
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            return new Error('Máximo número de reintentos de conexión alcanzado');
                        }
                        return Math.min(retries * 50, 2000);
                    }
                }
            });

            this.client.on('error', (err) => {
                logger.error('Error de Redis:', err);
                this.connected = false;
            });

            this.client.on('connect', () => {
                logger.info('Conectado a Redis');
                this.connected = true;
            });

            await this.client.connect();
        } catch (error) {
            logger.error('Error al conectar con Redis:', error);
            this.connected = false;
        }
    }

    async get(key) {
        try {
            if (!this.connected) return null;
            const value = await this.client.get(key);
            return value ? JSON.parse(value) : null;
        } catch (error) {
            logger.error('Error al obtener datos de Redis:', error);
            return null;
        }
    }

    async set(key, value, expireTime = 3600) {
        try {
            if (!this.connected) return false;
            await this.client.set(key, JSON.stringify(value), {
                EX: expireTime
            });
            return true;
        } catch (error) {
            logger.error('Error al guardar datos en Redis:', error);
            return false;
        }
    }

    async delete(key) {
        try {
            if (!this.connected) return false;
            await this.client.del(key);
            return true;
        } catch (error) {
            logger.error('Error al eliminar datos de Redis:', error);
            return false;
        }
    }
}

module.exports = new RedisClient();
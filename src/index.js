require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

const app = express();

// Configuración básica
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100 // límite de 100 solicitudes por ventana por IP
});
app.use(limiter);

// Rutas
app.use('/api', routes);

// Manejador de errores global
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Servidor iniciado en puerto ${PORT}`);
});

// Manejo de errores no capturados
process.on('uncaughtException', (error) => {
    logger.error('Error no capturado:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Promesa rechazada no manejada:', error);
    process.exit(1);
});
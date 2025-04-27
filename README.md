# TikSaverPro Backend

Backend para servicio de descarga de videos de TikTok sin marca de agua.

## Características

- ✨ Descarga de videos sin marca de agua
- 🚀 API REST optimizada
- 💾 Sistema de caché con Redis
- 🛡️ Protección contra abusos
- 📊 Sistema de logs
- 🔄 Manejo de errores robusto

## Requisitos

- Node.js 16 o superior
- Redis 6 o superior
- npm o yarn

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/tiksaverpro-backend.git
cd tiksaverpro-backend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

4. Editar el archivo `.env` con tus configuraciones

## Uso

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm start
```

## API Endpoints

### Procesar URL de TikTok
```http
POST /api/process
Content-Type: application/json

{
    "url": "https://www.tiktok.com/@usuario/video/1234567890"
}
```

### Descargar Video
```http
POST /api/download
Content-Type: application/json

{
    "videoId": "1234567890",
    "quality": "high" // high, medium, low
}
```

## Estructura del Proyecto

```
src/
├── config/         # Configuraciones
├── middleware/     # Middlewares
├── routes/         # Rutas de la API
├── services/       # Lógica de negocio
├── utils/          # Utilidades
└── index.js        # Punto de entrada
```

## Caché

El sistema utiliza Redis para cachear:
- Metadatos de videos (TTL: 1 hora)
- URLs de descarga (TTL: 5 minutos)

## Rate Limiting

- 100 solicitudes por IP cada 15 minutos
- Configurable mediante variables de entorno

## Logs

Los logs se almacenan en:
- `error.log`: Errores críticos
- `combined.log`: Todos los logs

## Seguridad

- Protección CORS
- Rate limiting por IP
- Validación de URLs
- Sanitización de entradas
- Headers de seguridad con Helmet

## Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing`)
3. Commit tus cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

## Licencia

MIT
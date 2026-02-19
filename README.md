# test00

Endpoint REST para consultar videos en tendencia por región usando YouTube Data API.

## Requisitos

- Node.js 18+
- Una API key de YouTube Data API v3

## Configuración

1. Copia `.env.example` a `.env`.
2. Completa `YOUTUBE_API_KEY`.

Variables disponibles:

- `YOUTUBE_API_KEY`: API key para YouTube Data API v3.
- `PORT` (opcional): puerto del servidor, por defecto `3000`.
- `CACHE_TTL_MS` (opcional): TTL de caché por región, por defecto `600000` ms (10 min).

## Ejecutar

```bash
npm install
npm start
```

## Endpoint

### `GET /api/youtube/trending?region=US`

Parámetros:

- `region` (obligatorio): código país ISO 3166-1 alpha-2 (ej. `US`, `MX`, `ES`).

Respuesta:

```json
{
  "region": "US",
  "count": 2,
  "items": [
    {
      "title": "Video title",
      "channel": "Channel Name",
      "views": 123456,
      "publishedAt": "2026-02-18T12:00:00Z",
      "thumbnail": "https://...jpg"
    }
  ],
  "cached": false
}
```

El campo `cached` indica si la respuesta proviene de caché en memoria por región.

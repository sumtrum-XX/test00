const express = require('express');

const app = express();
const port = process.env.PORT || 3000;
const apiKey = process.env.YOUTUBE_API_KEY;
const cacheTTLms = Number(process.env.CACHE_TTL_MS || 10 * 60 * 1000);
const cache = new Map();

function normalizeYouTubeItem(item) {
  return {
    title: item?.snippet?.title || '',
    channel: item?.snippet?.channelTitle || '',
    views: Number(item?.statistics?.viewCount || 0),
    publishedAt: item?.snippet?.publishedAt || null,
    thumbnail:
      item?.snippet?.thumbnails?.high?.url ||
      item?.snippet?.thumbnails?.medium?.url ||
      item?.snippet?.thumbnails?.default?.url ||
      null,
  };
}

app.get('/api/youtube/trending', async (req, res) => {
  const region = String(req.query.region || '').trim().toUpperCase();

  if (!region || !/^[A-Z]{2}$/.test(region)) {
    return res.status(400).json({
      error: 'Invalid region. Use an ISO 3166-1 alpha-2 country code, e.g. US, MX, ES.',
    });
  }

  if (!apiKey) {
    return res.status(500).json({ error: 'Missing YOUTUBE_API_KEY environment variable.' });
  }

  const cached = cache.get(region);
  if (cached && Date.now() < cached.expiresAt) {
    return res.json({ ...cached.payload, cached: true });
  }

  const params = new URLSearchParams({
    part: 'snippet,statistics',
    chart: 'mostPopular',
    regionCode: region,
    maxResults: '20',
    key: apiKey,
  });

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: 'YouTube API request failed.',
        details: body,
      });
    }

    const data = await response.json();
    const items = (data.items || []).map(normalizeYouTubeItem);

    const payload = {
      region,
      count: items.length,
      items,
      cached: false,
    };

    cache.set(region, {
      payload,
      expiresAt: Date.now() + cacheTTLms,
    });

    return res.json(payload);
  } catch (error) {
    return res.status(502).json({
      error: 'Unable to reach YouTube API.',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

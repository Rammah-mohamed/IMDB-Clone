const express = require('express');
const sharp = require('sharp');
const axios = require('axios');
const cache = new Map();
const app = express();

app.use(require('cors')());

// Enable Sharp caching
sharp.cache({
  memory: 50, // Maximum memory for caching (in MB)
  files: 20, // Maximum number of files to cache
  items: 100, // Maximum number of items in cache
});

app.get('/image', async (req, res) => {
  const { url, format = 'webp' } = req.query;
  if (!url) return res.status(400).send('Image URL is required.');

  const cacheKey = `${url}_${format}`;
  if (cache.has(cacheKey)) {
    res.set('Content-Type', `image/${format}`);
    return res.send(cache.get(cacheKey));
  }

  try {
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'arraybuffer',
    });

    const transformedImage = await sharp(response.data)
      .toFormat(format, { quality: 60, progressive: true })
      .withMetadata(false)
      .toBuffer();

    // Cache the image
    cache.set(cacheKey, transformedImage);

    res.set('Content-Type', `image/${format}`);
    res.send(transformedImage);
  } catch (err) {
    res.status(500).send('Error processing image.');
  }
});

app.listen(3100, () => {
  console.log('Image proxy server running on http://localhost:3100');
});

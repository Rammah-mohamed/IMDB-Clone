import sharp from "sharp";
import axios from "axios";

export default async function handler(req, res) {
  const { url, format = "webp" } = req.query;

  if (!url) {
    res.status(400).send("Image URL is required.");
    return;
  }

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });

    const transformedImage = await sharp(response.data)
      .toFormat(format, { quality: 60, progressive: true })
      .toBuffer();

    res.setHeader("Content-Type", `image/${format}`);
    res.setHeader("Cache-Control", "public, max-age=86400, immutable"); 
    res.send(transformedImage);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error processing image.");
  }
}

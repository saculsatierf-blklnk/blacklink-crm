const sharp = require('sharp');
const path = require('path');

const src = '/Users/blacklink.com.br/.gemini/antigravity/brain/b9ff108e-3882-4b47-a186-e6d80bb1ce76/.user_uploaded/media_1792095092284.jpg';

async function cleanPrism() {
  // Pega a região do prisma
  const { data, info } = await sharp(src)
    .extract({ left: 60, top: 15, width: 220, height: 190 })
    .raw()
    .toBuffer({ resolveWithObject: true });

  const width = info.width;
  const height = info.height;
  const channels = info.channels;

  // Cria cópia manipulável dos pixels
  const cleaned = Buffer.from(data);

  // Onde os pixels forem muito claros (a letra 'O' branca), substituímos pelo tom escuro do vidro do prisma
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      // A letra 'O' branca tem R, G, B > 180 na parte inferior direita da área do prisma
      if (x > 115 && y > 65 && r > 150 && g > 150 && b > 150) {
        // Amostra um pixel vizinho do corpo do prisma de vidro (mais acima ou à esquerda)
        const sampleY = Math.max(20, y - 45);
        const sampleX = Math.max(20, x - 35);
        const sampleIdx = (sampleY * width + sampleX) * channels;

        cleaned[idx] = data[sampleIdx];
        cleaned[idx + 1] = data[sampleIdx + 1];
        cleaned[idx + 2] = data[sampleIdx + 2];
      }
    }
  }

  await sharp(cleaned, { raw: { width, height, channels } })
    .png()
    .toFile('/Users/blacklink.com.br/blacklink.com.br/blacklink-crm/public/launch-pack/prism-cleaned.png');

  console.log('Prism cleaned without letter O!');
}

cleanPrism().catch(console.error);

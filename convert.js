import sharp from 'sharp';

async function convert() {
  await sharp('public/icon.svg')
    .png()
    .resize(512, 512)
    .toFile('public/apple-touch-icon.png');
  console.log('Converted successfully');
}

convert().catch(console.error);

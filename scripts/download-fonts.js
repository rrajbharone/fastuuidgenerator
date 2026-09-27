import fs from 'fs';
import path from 'path';
import https from 'https';

const fontsDir = path.resolve('public/fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const files = [
  'inter-latin-400-normal.woff2',
  'inter-latin-ext-400-normal.woff2',
  'inter-latin-500-normal.woff2',
  'inter-latin-ext-500-normal.woff2',
  'inter-latin-600-normal.woff2',
  'inter-latin-ext-600-normal.woff2',
];

function downloadFile(fileName) {
  return new Promise((resolve, reject) => {
    const dest = path.join(fontsDir, fileName);
    const url = `https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.0/files/${fileName}`;
    const file = fs.createWriteStream(dest);

    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          const stats = fs.statSync(dest);
          console.log(`Downloaded ${fileName} (${stats.size} bytes)`);
          resolve();
        });
      } else {
        file.close();
        fs.unlinkSync(dest);
        reject(new Error(`Failed to download ${fileName}: Status ${response.statusCode}`));
      }
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading Inter font files (400, 500, 600 latin & latin-ext)...');
  for (const file of files) {
    await downloadFile(file);
  }
  console.log('All font files downloaded successfully!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

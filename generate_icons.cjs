// Generates icon-192.png and icon-512.png using raw PNG encoding + zlib
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

function makePNG(size) {
  // Build RGBA pixel data: purple gradient with heart emoji area
  const pixels = new Uint8Array(size * size * 4);
  const cx = size / 2, cy = size / 2, r = size * 0.42;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const t = x / size, u = y / size;
      // Background: purple-to-pink gradient (#251B33 → #D6249F tinted)
      const bg_r = Math.round(37 + (214 - 37) * t);
      const bg_g = Math.round(27 + (36 - 27) * u);
      const bg_b = Math.round(51 + (159 - 51) * (1 - t));

      // Rounded rect mask (radius = size*0.22)
      const rad = size * 0.22;
      const dx = Math.max(0, Math.abs(x - cx) - (cx - rad));
      const dy = Math.max(0, Math.abs(y - cy) - (cy - rad));
      const inRect = Math.sqrt(dx * dx + dy * dy) < rad;

      if (!inRect) {
        pixels[i] = pixels[i+1] = pixels[i+2] = pixels[i+3] = 0; // transparent
        continue;
      }

      // Pink accent blobs
      const d1 = Math.sqrt((x - size*0.35)**2 + (y - size*0.38)**2) / (size*0.5);
      const d2 = Math.sqrt((x - size*0.65)**2 + (y - size*0.62)**2) / (size*0.5);
      const accent = Math.max(0, 1 - Math.min(d1, d2) * 1.8) * 0.45;

      pixels[i]   = Math.min(255, Math.round(bg_r + (255 - bg_r) * accent));
      pixels[i+1] = Math.min(255, Math.round(bg_g + (91 - bg_g) * accent));
      pixels[i+2] = Math.min(255, Math.round(bg_b + (174 - bg_b) * accent));
      pixels[i+3] = 255;

      // White heart overlay: simple heart formula
      const nx = (x / size - 0.5) * 2.6;
      const ny = (y / size - 0.48) * 2.6;
      const heart = (nx**2 + (ny - Math.sqrt(Math.abs(nx)))**2) < 0.85;
      if (heart) {
        pixels[i]   = Math.min(255, pixels[i]   + 100);
        pixels[i+1] = Math.min(255, pixels[i+1] + 40);
        pixels[i+2] = Math.min(255, pixels[i+2] + 60);
      }
    }
  }

  // Build PNG binary
  const sig = Buffer.from([137,80,78,71,13,10,26,10]);

  function chunk(type, data) {
    const tBuf = Buffer.from(type, 'ascii');
    const dBuf = Buffer.isBuffer(data) ? data : Buffer.from(data);
    const lenBuf = Buffer.alloc(4); lenBuf.writeUInt32BE(dBuf.length, 0);
    const crcBuf = Buffer.alloc(4);
    const crcData = Buffer.concat([tBuf, dBuf]);
    crcBuf.writeInt32BE(crc32(crcData), 0);
    return Buffer.concat([lenBuf, tBuf, dBuf, crcBuf]);
  }

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8]=8; ihdr[9]=6; ihdr[10]=0; ihdr[11]=0; ihdr[12]=0; // 8-bit RGBA

  // IDAT: filter byte 0 before each row, then deflate
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0; // filter=None
    const pixBuf = Buffer.from(pixels.buffer, y * size * 4, size * 4);
    pixBuf.copy(raw, y * (size * 4 + 1) + 1);
  }
  const compressed = zlib.deflateSync(raw, { level: 9 });

  const iend = Buffer.alloc(0);

  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', compressed), chunk('IEND', iend)]);
}

// CRC32 table
const crcTable = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ -1) | 0;
}

const outDir = path.join(__dirname, 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'icon-192.png'), makePNG(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), makePNG(512));
console.log('Icons generated: icon-192.png (192x192) and icon-512.png (512x512)');

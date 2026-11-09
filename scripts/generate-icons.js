import fs from 'fs';
import zlib from 'zlib';

function createCRC32Table() {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
}

const crcTable = createCRC32Table();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const body = Buffer.concat([typeBuf, data]);
  const crc = crc32(body);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc, 0);

  return Buffer.concat([lenBuf, body, crcBuf]);
}

function generateIconPNG(size, outputPath) {
  // Color palette: deep navy background #0B1020, gold/amber accent #F59E0B
  const width = size;
  const height = size;
  
  // Raw scanlines: each row has 1 filter byte (0) + width * 4 bytes (RGBA)
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);
  
  const cx = width / 2;
  const cy = height / 2;
  const r = width * 0.44;
  const cornerR = width * 0.22;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      
      // Rounded rect mask
      const dx = Math.max(0, Math.abs(x - cx) - (cx - cornerR));
      const dy = Math.max(0, Math.abs(y - cy) - (cy - cornerR));
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist > cornerR) {
        // Transparent outside rounded corner
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
        continue;
      }

      // Inside icon
      // Base background: #0B1020 (11, 16, 32)
      let rVal = 11;
      let gVal = 16;
      let bVal = 32;

      // Inner border #1E2D4A
      const borderDx = Math.max(0, Math.abs(x - cx) - (cx - cornerR - 6));
      const borderDy = Math.max(0, Math.abs(y - cy) - (cy - cornerR - 6));
      const borderDist = Math.sqrt(borderDx * borderDx + borderDy * borderDy);
      if (dist <= cornerR && borderDist > cornerR - 6) {
        rVal = 30;
        gVal = 45;
        bVal = 74;
      }

      // Draw emblem in center: Diamond / Graduation Cap & Badge
      const nx = (x - cx) / (width * 0.35);
      const ny = (y - cy) / (height * 0.35);
      
      // Academic cap / Diamond: |nx| + |ny| <= 0.8
      if (Math.abs(nx) + Math.abs(ny) <= 0.65) {
        // Amber gradient #F59E0B -> #D97706
        rVal = 245;
        gVal = 158;
        bVal = 11;
      } else if (Math.abs(nx) + Math.abs(ny) <= 0.75) {
        // Highlight stroke
        rVal = 251;
        gVal = 191;
        bVal = 36;
      }

      // Small central star / deal dot
      if (Math.abs(nx) <= 0.15 && Math.abs(ny - 0.2) <= 0.15) {
        rVal = 255;
        gVal = 255;
        bVal = 255;
      }

      rawData[pxOffset] = rVal;
      rawData[pxOffset + 1] = gVal;
      rawData[pxOffset + 2] = bVal;
      rawData[pxOffset + 3] = 255;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth 8
  ihdrData[9] = 6; // color type 6: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // IDAT
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  const pngBuffer = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`Generated ${outputPath} (${width}x${height}, ${pngBuffer.length} bytes)`);
}

generateIconPNG(192, 'public/pwa-192x192.png');
generateIconPNG(512, 'public/pwa-512x512.png');
generateIconPNG(512, 'public/pwa-maskable-512x512.png');
generateIconPNG(180, 'public/apple-touch-icon.png');

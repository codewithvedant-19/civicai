import sharp from "sharp";

// Real (not mocked) perceptual hashing: a difference-hash (dHash) computed
// from a downscaled 9x8 grayscale version of the image. Two visually similar
// photos of the same pothole hash to the same or a very close value, which
// is what powers duplicate detection in DuplicateDetectionService.
export async function computePerceptualHash(buffer: Buffer): Promise<string> {
  const { data } = await sharp(buffer)
    .resize(9, 8, { fit: "fill" })
    .grayscale()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let hash = "";
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const left = data[row * 9 + col];
      const right = data[row * 9 + col + 1];
      hash += left > right ? "1" : "0";
    }
  }
  // 64-bit binary string -> hex for compact storage
  return BigInt("0b" + hash).toString(16).padStart(16, "0");
}

export function hammingDistanceHex(a: string, b: string): number {
  const ai = BigInt("0x" + a);
  const bi = BigInt("0x" + b);
  let x = ai ^ bi;
  let count = 0;
  while (x > 0n) {
    count += Number(x & 1n);
    x >>= 1n;
  }
  return count;
}

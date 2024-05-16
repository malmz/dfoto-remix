import sharp from 'sharp';

export async function createThumbnail(input: string, output: string) {
  await sharp(input)
    .resize(300, 200, { fit: 'cover', position: sharp.strategy.entropy })
    .rotate()
    .webp()
    .toFile(output);
}

export async function createPreview(input: string, output: string) {
  await sharp(input)
    .resize(1200, 800, { fit: 'inside' })
    .rotate()
    .webp()
    .toFile(output);
}

export async function createOptimized(
  input: string,
  thumbnailOutput: string,
  previewOutput: string
) {
  const pipeline = sharp(input).rotate().webp().clone();
  await Promise.all([
    pipeline
      .resize(300, 200, { fit: 'cover', position: sharp.strategy.entropy })
      .toFile(thumbnailOutput),
    pipeline.resize(null, 800).toFile(previewOutput),
  ]);
}

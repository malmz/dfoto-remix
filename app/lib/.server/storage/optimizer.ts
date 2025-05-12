import sharp from 'sharp';

export async function createThumbnail(input: string, output: string) {
	await sharp(input)
		.rotate()
		.webp()
		.resize(300, 200, { fit: 'cover', position: sharp.strategy.entropy })
		.toFile(output);
}

export async function createPreview(input: string, output: string) {
	await sharp(input)
		.rotate()
		.webp()
		.resize(1200, 800, { fit: 'inside' })
		.toFile(output);
}

export async function createOptimized(
	input: string,
	thumbnailOutput: string,
	previewOutput: string,
) {
	const pipeline = sharp(input).rotate().webp().clone();
	await Promise.all([
		pipeline
			.resize(300, 200, { fit: 'cover', position: sharp.strategy.entropy })
			.toFile(thumbnailOutput),
		pipeline.resize(1200, 800, { fit: 'inside' }).toFile(previewOutput),
	]);
}

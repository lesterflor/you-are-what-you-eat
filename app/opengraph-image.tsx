import { ImageResponse } from 'next/og';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// Image metadata
export const alt = 'You Are What You Eat';
export const size = {
	width: 1200,
	height: 630
};

export const contentType = 'image/png';

// Image generation
export default async function Image() {
	// Font loading, process.cwd() is Next.js project directory
	const Oswald = await readFile(
		join(process.cwd(), 'public/fonts/Oswald-Regular.ttf')
	);

	return new ImageResponse(
		(
			// ImageResponse JSX element
			<div
				style={{
					fontSize: 150,
					background: '#250',
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#ffffff'
				}}>
				<span>You Are</span>
				<span>What You</span>
				<span>Eat</span>
			</div>
		),
		// ImageResponse options
		{
			// For convenience, we can re-use the exported opengraph-image
			// size config to also set the ImageResponse's width and height.
			...size,
			fonts: [
				{
					name: 'Oswald',
					data: Oswald,
					style: 'normal',
					weight: 400
				}
			]
		}
	);
}

import { UtensilsCrossed } from 'lucide-react';
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
	const interSemiBold = await readFile(
		join(process.cwd(), 'public/fonts/Inter_18pt-Regular.ttf')
	);

	return new ImageResponse(
		(
			// ImageResponse JSX element
			<div
				style={{
					fontSize: 128,
					background: 'green',
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center'
				}}>
				<UtensilsCrossed className='w-20 h-20' />
			</div>
		),
		// ImageResponse options
		{
			// For convenience, we can re-use the exported opengraph-image
			// size config to also set the ImageResponse's width and height.
			...size,
			fonts: [
				{
					name: 'Inter',
					data: interSemiBold,
					style: 'normal',
					weight: 400
				}
			]
		}
	);
}

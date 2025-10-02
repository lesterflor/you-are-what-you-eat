import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'You Are What You Eat',
		short_name: 'YouRWYEat',
		description:
			'What you put in your mouth determines what your body is composed of.  Find out the composition of your body by tracking what you eat.',
		start_url: '/',
		display: 'standalone',
		background_color: '#ffffff',
		theme_color: '#000000',
		icons: [
			{
				src: '/android-chrome-192x192.png',
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: '/android-chrome-512x512.png',
				sizes: '512x512',
				type: 'image/png'
			}
		]
	};
}

'use client';

import Image from 'next/image';

export default function FullImagePreview({
	image,
	onClick
}: {
	image?: string | null;
	onClick?: () => void;
}) {
	return (
		<div
			className='absolute z-50 w-full h-full'
			onClick={() => {
				onClick?.();
			}}>
			{image && (
				<Image
					src={image}
					width={500}
					height={1000}
					alt='image'
				/>
			)}
		</div>
	);
}

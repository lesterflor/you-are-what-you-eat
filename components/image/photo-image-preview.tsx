'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

export default function PhotoImagePreview({
	image,
	className,
	onClick
}: {
	image: string | null;
	className?: string;
	onClick?: () => void;
}) {
	return (
		<div
			onClick={() => {
				onClick?.();
			}}
			className={cn('w-16 h-28 rounded-md', className)}>
			{image && (
				<Image
					src={image}
					width={100}
					height={100}
					alt='image'
					className='w-16 h-28 rounded-md'
				/>
			)}
		</div>
	);
}

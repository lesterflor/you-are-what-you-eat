'use client';

import { useEffect, useState } from 'react';
import { useAnimate } from 'motion/react-mini';
import Image, { StaticImageData } from 'next/image';
import { cn } from '@/lib/utils';
import { ImSpinner9 } from 'react-icons/im';

export default function FadeInImage({
	src,
	alt,
	width,
	height,
	className = '',
	duration = 1,
	priority = false
}: {
	src: string | StaticImageData;
	alt: string;
	width: number;
	height: number;
	className: string;
	duration?: number;
	priority?: boolean;
}) {
	const [loaded, setLoaded] = useState(false);
	const [scope, animate] = useAnimate();

	useEffect(() => {
		if (loaded) {
			animate(scope.current, { opacity: 1 }, { duration });
		}
	}, [loaded]);
	return (
		<>
			{!loaded && (
				<div className='flex flex-col items-center justify-center h-full w-auto'>
					<ImSpinner9 className='w-8 h-8 animate-spin opacity-5' />
				</div>
			)}

			<Image
				priority={priority}
				className={cn(
					'opacity-0 transition-opacity duration-700',
					className && className
				)}
				ref={scope}
				src={src}
				alt={alt}
				width={width}
				height={height}
				onLoad={() => setLoaded(true)}
			/>
		</>
	);
}

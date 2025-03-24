'use client';

import { cn } from '@/lib/utils';
import { useEffect, useRef, useState } from 'react';

export default function TruncateSection({
	children,
	allowSeeMore = true,
	pixelHeight = 120,
	label = 'Read more'
}: {
	children: React.ReactNode;
	allowSeeMore?: boolean;
	pixelHeight?: number;
	label?: string;
}) {
	const [hasClickedSeeMore, setHasClickedSeeMore] = useState(false);

	useEffect(() => {
		if (hasClickedSeeMore) {
			setTimeout(() => {
				divRef.current.style.height = 'auto';
			}, 1000);
		}
	}, [hasClickedSeeMore]);

	const htmlDiv = useRef({} as HTMLDivElement);
	const divRef = useRef({} as HTMLDivElement);

	return (
		<>
			<div className='flex flex-col items-end relative'>
				<div
					className='w-full text-[110%] absolute opacity-0 -top-[500vh] pointer-events-none'
					ref={htmlDiv}>
					{children}
				</div>
				<div className='relative flex flex-col items-end gap-0'>
					<div
						ref={divRef}
						className={cn(
							'overflow-hidden transition-height duration-500 ease-in-out'
						)}
						style={{
							height:
								hasClickedSeeMore && allowSeeMore
									? `${htmlDiv.current.offsetHeight}px`
									: `${pixelHeight}px`
						}}>
						{children}
					</div>

					<div
						className={cn('gradientback', hasClickedSeeMore && 'hidden')}></div>
				</div>

				{!hasClickedSeeMore ? (
					<div className='w-fit flex flex-row items-end justify-end align-bottom select-none'>
						<div
							className='cursor-pointer select-none text-xs hover:text-foreground'
							onClick={() => {
								setHasClickedSeeMore(true);
							}}>
							... {label}
						</div>
					</div>
				) : (
					''
				)}
			</div>
		</>
	);
}

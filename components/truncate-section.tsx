'use client';

import { cn } from '@/lib/utils';
import { useRef, useState } from 'react';

export default function TruncateSection({
	children,
	allowSeeMore = true,
	pixelHeight = 120
}: {
	children: React.ReactNode;
	allowSeeMore?: boolean;
	pixelHeight?: number;
}) {
	const [hasClickedSeeMore, setHasClickedSeeMore] = useState(false);

	const htmlDiv = useRef({} as HTMLDivElement);
	const divRef = useRef({} as HTMLDivElement);

	return (
		<>
			<div className='flex flex-col items-end'>
				<div
					className='w-full text-[110%] absolute opacity-0 pointer-events-none'
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
							... Read more
						</div>
					</div>
				) : (
					''
				)}
			</div>
		</>
	);
}

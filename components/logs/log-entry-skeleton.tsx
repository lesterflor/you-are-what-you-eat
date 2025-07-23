'use client';

import { Calendar, Flame } from 'lucide-react';
import { FaGlassWater } from 'react-icons/fa6';
import { IoFastFoodOutline } from 'react-icons/io5';
import { Skeleton } from '../ui/skeleton';

export default function LogEntrySkeleton() {
	return (
		<>
			{Array.from({ length: 2 }).map((_v, indx) => (
				<div
					className='flex flex-col gap-2'
					key={indx}>
					<div className='flex flex-row gap-2 items-start'>
						<Calendar className='w-4 h-4 portrait:w-6 portrait:h-6 opacity-25' />
						<Skeleton className='w-28 h-6' />
					</div>
					<div className='flex flex-row items-center justify-start gap-8 rounded-md border-2 p-2'>
						<div className='flex flex-col items-center gap-2'>
							<div className='flex flex-col gap-2 text-xs'>
								<div className='flex flex-col items-center justify-center gap-1 rounded-md border-2 p-1'>
									<Skeleton className='w-32 h-4' />

									<div className='flex flex-row items-center gap-1'>
										<FaGlassWater className='w-4 h-4 opacity-25' />
										<Skeleton className='w-12 h-4' />
									</div>
								</div>

								<div className='flex flex-col items-center justify-center gap-1 rounded-md border-2 p-1'>
									<Skeleton className='w-32 h-4' />

									<div className='flex flex-row items-center gap-1'>
										<IoFastFoodOutline className='w-4 h-4  opacity-25' />
										<Skeleton className='w-12 h-4' />
									</div>
								</div>

								<div className='flex flex-col items-center justify-center gap-1 rounded-md border-2 p-1'>
									<Skeleton className='w-32 h-4' />{' '}
									<Skeleton className='w-12 h-4' />
								</div>

								<div className='flex flex-col items-center justify-center gap-1 rounded-md border-2 p-1'>
									<Skeleton className='w-32 h-4' />{' '}
									<div className='flex flex-row items-center gap-1'>
										<Flame className='w-4 h-4  opacity-25' />
										<Skeleton className='w-12 h-4' />
									</div>
								</div>

								<div className='text-2xl font-bold w-full text-center flex flex-row items-center gap-2 justify-center'>
									<Skeleton className='w-24 h-10' />
								</div>

								<Skeleton className='w-32 h-10'></Skeleton>
							</div>
						</div>

						<div className='flex flex-col gap-2'>
							<div className='flex flex-row gap-1 flex-wrap'>
								<Skeleton className='w-16 h-12' />
								<Skeleton className='w-16 h-12' />
								<Skeleton className='w-16 h-12' />
								<Skeleton className='w-16 h-12' />
							</div>

							<Skeleton className='w-32 h-4' />

							<div className='flex flex-row gap-2 flex-wrap'>
								<Skeleton className='w-20 h-8' />
								<Skeleton className='w-20 h-8' />
								<Skeleton className='w-20 h-8' />
							</div>
						</div>
					</div>

					<br />
				</div>
			))}
		</>
	);
}

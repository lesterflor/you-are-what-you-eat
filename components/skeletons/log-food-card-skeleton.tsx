import React from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Skeleton } from '../ui/skeleton';

export default function LogFoodCardSkeleton() {
	return (
		<Card>
			<CardHeader className='pb-2 flex flex-row items-center justify-between gap-2 pt-2'>
				<div className='flex flex-col gap-2'>
					<div>
						<Skeleton className='w-44 h-6' />
					</div>
					<span className='flex flex-row items-center'>
						<Skeleton className='w-44 h-2' />
					</span>
				</div>
				<Skeleton className='w-8 h-8' />
			</CardHeader>
			<CardDescription className='px-6 pb-4 flex flex-col gap-2'>
				<Skeleton className='w-44 h-4 p-2' />
				<Skeleton className='w-44 h-4 p-2' />
			</CardDescription>
			<CardContent>
				<div className='flex flex-row flex-wrap gap-1'>
					<Skeleton className='w-12 h-8' />
					<Skeleton className='w-12 h-8' />
					<Skeleton className='w-12 h-8' />
					<Skeleton className='w-12 h-8' />
				</div>
			</CardContent>
		</Card>
	);
}

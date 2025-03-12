'use client';

import { GetLog } from '@/types';
import { Badge } from '../ui/badge';
import { useEffect, useState } from 'react';
import LogFoodCard from './log-food-card';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { IoFastFoodOutline } from 'react-icons/io5';

export default function FoodLogList({
	log,
	useScroller = true
}: {
	log: GetLog;
	useScroller?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [sortList, setSortList] = useState(log.foodItems);

	useEffect(() => {
		const total = log.foodItems.reduce((acc, curr) => {
			const sub = curr.calories * curr.numServings;
			console.log('acc:', acc, ' curr.calories:', sub);
			return acc + sub;
		}, 0);
		setTotalCals(total);

		const sorted = sortList.sort((a, b) => {
			return b.eatenAt.getTime() - a.eatenAt.getTime();
		});
		setSortList(sorted);
	}, []);

	return (
		<>
			<div
				className={cn(
					'flex flex-col items-center w-fit pb-4',
					useScroller ? 'absolute' : 'relative'
				)}>
				<Badge className='text-lg font-semibold flex flex-row gap-3'>
					<IoFastFoodOutline className='w-5 h-5 animate-pulse' />
					Calories for today: {totalCals}
				</Badge>
			</div>

			{useScroller ? (
				<ScrollArea className='h-[80vh] pr-5 mt-12 w-full'>
					<br />
					<div className='flex flex-col gap-4 w-full'>
						<div className='flex flex-col gap-4'>
							{sortList.map((item, indx) => (
								<LogFoodCard
									item={item}
									key={`${item}-${indx}`}
								/>
							))}
						</div>
					</div>
					<br />
				</ScrollArea>
			) : (
				<div className='flex flex-col gap-4 w-full'>
					<div className='flex flex-col gap-4'>
						{sortList.map((item, indx) => (
							<LogFoodCard
								item={item}
								key={`${item}-${indx}`}
							/>
						))}
					</div>
				</div>
			)}
		</>
	);
}

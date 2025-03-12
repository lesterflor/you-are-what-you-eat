'use client';

import { GetFoodEntry, GetLog } from '@/types';
import { Badge } from '../ui/badge';
import { useContext, useEffect, useState } from 'react';
import LogFoodCard from './log-food-card';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import { IoFastFoodOutline } from 'react-icons/io5';
import { createDailyLog } from '@/actions/log-actions';
import { format } from 'date-fns';
import { LogUpdateContext } from '@/contexts/log-context';

export default function FoodLogList({
	useScroller = true
}: {
	useScroller?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [sortList, setSortList] = useState<GetFoodEntry[]>([]);
	const [logList, setLogList] = useState<GetFoodEntry[]>([]);
	const [log, setLog] = useState<GetLog>();
	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		getLog();
	}, []);

	const getLog = async () => {
		const res = await createDailyLog();

		if (res?.success && res.data) {
			console.log(JSON.stringify(res.data));
			setLog(res.data as GetLog);
			setLogList(res.data.foodItems as GetFoodEntry[]);
		}
	};

	useEffect(() => {
		if (logList.length > 0) {
			prepareLogList();
		}
	}, [logList]);

	const prepareLogList = () => {
		const total = logList.reduce((acc, curr) => {
			const sub = curr.calories * curr.numServings;
			console.log('acc:', acc, ' curr.calories:', sub);
			return acc + sub;
		}, 0);
		setTotalCals(total);

		const sorted = logList.sort((a, b) => {
			return b.eatenAt.getTime() - a.eatenAt.getTime();
		});
		setSortList(sorted);
	};

	useEffect(() => {
		if (logContext?.updated) {
			getLog();
		}
	}, [logContext]);

	return (
		<>
			<div
				className={cn(
					'flex flex-col items-center w-fit pb-4',
					useScroller ? 'absolute' : 'relative'
				)}>
				<Badge className='text-lg font-semibold flex flex-row gap-3'>
					<IoFastFoodOutline className='w-5 h-5 animate-pulse' />
					Calories for today
					{log?.createdAt && (
						<span className='text-xs hidden'>
							({format(log?.createdAt as Date, 'PP')})
						</span>
					)}{' '}
					{totalCals}
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

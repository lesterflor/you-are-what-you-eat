'use client';

import { BaseMetabolicRateType, GetFoodEntry, GetLog } from '@/types';
import { Badge } from '../ui/badge';
import { useContext, useEffect, useState } from 'react';
import LogFoodCard from './log-food-card';
import { ScrollArea } from '../ui/scroll-area';
import { cn, formatUnit } from '@/lib/utils';
import { IoFastFoodOutline } from 'react-icons/io5';
import { createDailyLog } from '@/actions/log-actions';
import { LogUpdateContext } from '@/contexts/log-context';
import { HeartPulse, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import LogMacrosSummary from './log-macros-summary';

export default function FoodLogList({
	useScroller = true
}: {
	useScroller?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [sortList, setSortList] = useState<GetFoodEntry[]>([]);
	const [logList, setLogList] = useState<GetFoodEntry[]>([]);
	const [log, setLog] = useState<GetLog>();
	const [bmr, setBmr] = useState<BaseMetabolicRateType>();

	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		getLog();
	}, []);

	// const getUserBMR = async () => {
	// 	const user = session?.user as GetUser;

	// 	if (user) {
	// 		const res = await getBMRById(user.id);

	// 		if (res.success && res.data) {
	// 			setBmr(res.data);
	// 		}
	// 	}
	// };

	const getLog = async () => {
		const res = await createDailyLog();

		if (res?.success && res.data) {
			setLog(res.data as GetLog);
			setLogList(res.data.foodItems as GetFoodEntry[]);

			const bmrArr = res.data.user.BaseMetabolicRate as BaseMetabolicRateType[];

			setBmr(bmrArr[0]);
		}
	};

	useEffect(() => {
		if (logList.length > 0) {
			prepareLogList();
		}
	}, [logList]);

	const prepareLogList = () => {
		const total = Math.round(
			logList.reduce((acc, curr) => {
				const sub = curr.calories * curr.numServings;
				return acc + sub;
			}, 0)
		);
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
					'flex flex-row items-center w-fit pb-4 gap-2',
					useScroller ? 'absolute' : 'relative'
				)}>
				<div className='flex flex-col items-start w-fit gap-1'>
					<Popover>
						<PopoverTrigger asChild>
							<Button className='p-1 text-md portrait:text-sm font-semibold flex flex-row gap-3 w-full'>
								<IoFastFoodOutline className='w-4 h-4 animate-pulse' />
								Current Cals {totalCals}
							</Button>
						</PopoverTrigger>
						<PopoverContent>
							<LogMacrosSummary
								compactMode={true}
								detailedMode={true}
							/>
						</PopoverContent>
					</Popover>

					{bmr && (
						<Badge
							variant='secondary'
							className='text-md portrait:text-sm font-semibold flex flex-row gap-3'>
							<HeartPulse className='w-5 h-5 animate-pulse' />
							Your BMR {formatUnit(bmr.bmr)}
						</Badge>
					)}
				</div>

				{bmr && (
					<div
						className={cn(
							'text-3xl portrait:text-2xl text-center flex flex-col items-center gap-0',
							Math.sign(totalCals - bmr.bmr) === -1
								? 'text-green-800'
								: 'text-red-800'
						)}>
						<div className='font-semibold'>
							{formatUnit((totalCals - bmr.bmr) * -1)}
						</div>
						<div className='text-xs'>
							{Math.sign(totalCals - bmr.bmr) === -1 ? 'remaining' : 'over'}
						</div>
						<div>
							{Math.sign(totalCals - bmr.bmr) === -1 ? (
								<ThumbsUp className='w-4 h-4 animate-ping' />
							) : (
								<ThumbsDown className='w-4 h-4 animate-ping' />
							)}
						</div>
					</div>
				)}
			</div>

			{useScroller ? (
				<ScrollArea
					className={cn('h-[80vh] pr-5 mt-12 w-full', bmr && 'h-[72vh] mt-20')}>
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
			<div className='hidden'>{log?.id}</div>
		</>
	);
}

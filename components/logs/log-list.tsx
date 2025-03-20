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
import { BicepsFlexed, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import LogMacrosSummary from './log-macros-summary';
// import LogFoodCardSkeleton from '../skeletons/log-food-card-skeleton';

export default function FoodLogList({
	forceColumn = true,
	useScroller = true,
	iconPosition = 'right',
	className
}: {
	useScroller?: boolean;
	iconPosition?: 'right' | 'top';
	className?: string;
	forceColumn?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [logList, setLogList] = useState<GetFoodEntry[]>([]);
	const [log, setLog] = useState<GetLog>();
	const [bmr, setBmr] = useState<BaseMetabolicRateType>();
	const [calsBurned, setCalsBurned] = useState(0);
	const [remainingCals, setRemainingCals] = useState(0);

	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		getLog();
	}, []);

	const getLog = async () => {
		const res = await createDailyLog();

		if (res?.success && res.data) {
			setLog(res.data as GetLog);

			const list = [...(res.data.foodItems as GetFoodEntry[])];

			list.sort((a, b) => {
				return b.eatenAt.getTime() - a.eatenAt.getTime();
			});

			setLogList(list);
			const bmrArr = res.data.user.BaseMetabolicRate as BaseMetabolicRateType[];

			setBmr(bmrArr[0]);

			if (
				res.data.knownCaloriesBurned &&
				res.data.knownCaloriesBurned.length > 0
			) {
				setCalsBurned(res.data.knownCaloriesBurned[0].calories);
			}
		}
	};

	useEffect(() => {
		prepareLogList();
	}, [logList]);

	const prepareLogList = () => {
		const total = Math.round(
			logList.reduce((acc, curr) => {
				const sub = curr.calories * curr.numServings;
				return acc + sub;
			}, 0)
		);
		setTotalCals(total);
	};

	useEffect(() => {
		//set remaining cals
		const brmCals = bmr?.bmr ?? 0;
		const rCals = brmCals + calsBurned;
		const remainder = totalCals - rCals;
		setRemainingCals(remainder);
	}, [totalCals, bmr]);

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
				<div className='flex flex-col items-start w-full gap-1'>
					<Popover>
						<PopoverTrigger asChild>
							<Button className='p-1 portrait:text-sm flex flex-row gap-2 w-48'>
								<IoFastFoodOutline className='w-4 h-4 animate-pulse' />
								Current Calories
								<span className='font-semibold'> {totalCals}</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent>
							<LogMacrosSummary
								log={log}
								compactMode={true}
								detailedMode={true}
								useSkeleton={true}
							/>
						</PopoverContent>
					</Popover>

					<div className='flex flex-row gap-2 w-full'>
						{bmr && (
							<Badge
								variant='outline'
								className='text-sm font-normal portrait:text-sm flex flex-row gap-3'>
								BMR {formatUnit(bmr.bmr)}
							</Badge>
						)}

						{calsBurned > 0 && (
							<Badge
								variant='outline'
								className='text-sm font-normal portrait:text-sm flex flex-row gap-3'>
								Cals burned: {formatUnit(calsBurned)}
							</Badge>
						)}
					</div>
				</div>

				{bmr && (
					<div
						className={cn(
							'text-3xl portrait:text-2xl text-center flex flex-col items-center gap-0 relative font-bold',
							Math.sign(remainingCals) === -1
								? 'text-foreground'
								: 'text-muted-foreground'
						)}>
						<div className='font-semibold'>
							{formatUnit(remainingCals * -1)}
						</div>
						<div className='text-xs font-normal'>
							{Math.sign(remainingCals) === -1 ? 'cals remaining' : 'cals over'}
						</div>
						{totalCals > 0 && (
							<div
								className={cn(
									'absolute',
									iconPosition === 'top' ? '-top-5' : 'top-4 -right-6'
								)}>
								{Math.sign(remainingCals) === -1 ? (
									<ThumbsUp className='w-4 h-4 animate-ping' />
								) : (
									<ThumbsDown className='w-4 h-4 animate-ping' />
								)}
							</div>
						)}
					</div>
				)}
			</div>

			{useScroller ? (
				<ScrollArea
					className={cn(
						'h-[80vh] pr-3 mt-12 w-full',
						bmr && 'h-[72vh] mt-20',
						className
					)}>
					<br />
					<div className='flex flex-col gap-4 w-full'>
						<div
							className={cn(
								'gap-4',
								forceColumn
									? 'flex flex-col'
									: 'grid grid-cols-2 lg:grid-cols-3 portrait:flex flex-col'
							)}>
							<>
								{logList.length > 0 ? (
									logList.map((item, indx) => (
										<LogFoodCard
											allowEdit={true}
											indx={indx}
											item={item}
											key={`${item}-${indx}`}
										/>
									))
								) : (
									<div className='flex flex-row items-center justify-center gap-2 text-muted-foreground opacity-50 col-span-2'>
										<BicepsFlexed className='w-16 h-16' />
										Nothing logged yet!
									</div>
								)}
							</>
						</div>
					</div>
					<br />
				</ScrollArea>
			) : (
				<div className='flex flex-col gap-4 w-full'>
					<div className='flex flex-col gap-4'>
						{logList.map((item, indx) => (
							<LogFoodCard
								allowEdit={true}
								indx={indx}
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

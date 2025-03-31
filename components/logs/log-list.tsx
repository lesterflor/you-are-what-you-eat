'use client';

import { BaseMetabolicRateType, GetFoodEntry, GetLog } from '@/types';
import { useContext, useEffect, useState } from 'react';
import LogFoodCard from './log-food-card';
import { ScrollArea } from '../ui/scroll-area';
import { cn, formatUnit } from '@/lib/utils';
import { IoFastFoodOutline } from 'react-icons/io5';
import { createDailyLog } from '@/actions/log-actions';
import { LogUpdateContext } from '@/contexts/log-context';
import { BicepsFlexed, Calendar, ThumbsDown, ThumbsUp } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import LogMacrosSummary from './log-macros-summary';
import LogRemainderBadge from './log-remainder-badge';
import { Skeleton } from '../ui/skeleton';
import { useScrolling } from '@/hooks/use-scroll';
import { Card, CardContent } from '../ui/card';
import { FaSpinner } from 'react-icons/fa';

export default function FoodLogList({
	forceColumn = true,
	useScroller = true,
	iconPosition = 'right',
	className,
	useFloaterNav = false
}: {
	useScroller?: boolean;
	iconPosition?: 'right' | 'top';
	className?: string;
	forceColumn?: boolean;
	useFloaterNav?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [logList, setLogList] = useState<GetFoodEntry[]>([]);
	const [log, setLog] = useState<GetLog>();
	const [bmr, setBmr] = useState<BaseMetabolicRateType>();
	const [calsBurned, setCalsBurned] = useState(0);
	const [remainingCals, setRemainingCals] = useState(0);
	const { scrollingUp, delta } = useScrolling();

	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		getLog();
	}, []);

	const getLog = async () => {
		const res = await createDailyLog();

		if (res?.success && res.data) {
			setLog(res.data as GetLog);

			const sortedFoodList = [...res.data.foodItems].sort(
				(a, b) => b.eatenAt.getTime() - a.eatenAt.getTime()
			);

			setLogList(sortedFoodList as GetFoodEntry[]);
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
				<div
					className={cn(
						'flex flex-col items-start w-full gap-1',
						useFloaterNav && 'hidden'
					)}>
					<Popover modal={true}>
						<PopoverTrigger asChild>
							<Button className='p-1 portrait:text-sm flex flex-row gap-2 w-60'>
								<IoFastFoodOutline className='w-4 h-4 animate-pulse' />
								Calories Consumed
								<span className='font-semibold'> {totalCals}</span>
							</Button>
						</PopoverTrigger>
						<PopoverContent className='max-w-[80vw] w-auto'>
							<LogMacrosSummary
								showPie={true}
								log={log}
								compactMode={true}
								detailedMode={true}
								useSkeleton={true}
							/>
						</PopoverContent>
					</Popover>

					<div className='flex flex-row gap-2 w-full'>
						{bmr ? (
							<div className='p-1 rounded-md border-2 items-center font-normal text-xs flex flex-col gap-0 w-16'>
								<span>BMR</span>
								<span>{formatUnit(bmr.bmr)}</span>
							</div>
						) : (
							<div className='flex flex-row gap-2'>
								<Skeleton className='w-16 h-10' />
								<Skeleton className='w-16 h-10' />
							</div>
						)}

						{calsBurned > 0 && (
							<div className='p-1 rounded-md border-2 font-normal text-xs flex flex-col gap-0 items-center w-16'>
								<span>Expended</span>
								<span>{formatUnit(calsBurned)}</span>
							</div>
						)}

						{bmr && <LogRemainderBadge />}
					</div>
				</div>

				{bmr ? (
					<div
						className={cn(
							'text-3xl portrait:text-2xl text-center flex flex-col items-center gap-0 relative font-bold',
							Math.sign(remainingCals) === -1
								? 'text-foreground'
								: 'text-muted-foreground',
							useFloaterNav && 'hidden'
						)}>
						<div className='font-semibold'>
							{formatUnit(remainingCals * -1)}
						</div>
						<div className='text-xs font-normal'>
							{Math.sign(remainingCals) === -1
								? 'calories remaining'
								: 'calories over'}
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
				) : (
					<Skeleton className={cn('w-14 h-14', useFloaterNav && 'hidden')} />
				)}
			</div>

			{useScroller ? (
				<ScrollArea
					className={cn(
						'h-[80vh] pr-0 mt-12 w-full',
						bmr && 'h-[60vh] mt-24',
						className,
						useFloaterNav && 'mt-1'
					)}>
					<div className='flex flex-col gap-2 w-full'>
						{logList.length > 0 && (
							<div className='flex flex-row items-center gap-2'>
								<Calendar className='w-4 h-4' />
								Today&apos;s Log
							</div>
						)}
						<div
							className={cn(
								'w-full',
								forceColumn
									? 'flex flex-col gap-4'
									: 'flex flex-row flex-wrap gap-4 portrait:flex-col'
							)}>
							<>
								{logList.length > 0 ? (
									<>
										{logList.map((item, indx) => (
											<LogFoodCard
												allowEdit={true}
												indx={indx}
												item={item}
												key={`${item.id}-${item.eatenAt.getTime()}`}
											/>
										))}
									</>
								) : (
									<div className='flex flex-row items-center justify-center gap-2 text-muted-foreground opacity-40 fixed top-[45vh]'>
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
								key={`${item.id}-${item.eatenAt.getTime()}`}
							/>
						))}
					</div>
				</div>
			)}

			{useFloaterNav && (
				<Card
					className={cn(
						'fixed bottom-0 left-0 transition-all duration-1000 w-fit',
						!scrollingUp ? 'bottom-0' : '-bottom-96',
						delta === 0 && 'bottom-0'
					)}>
					<CardContent className='p-2 pt-5 flex flex-row items-center gap-2'>
						<div className={cn('flex flex-col items-start w-full gap-1')}>
							<Popover modal={true}>
								<PopoverTrigger asChild>
									<Button className='p-1 portrait:text-sm flex flex-row gap-2 w-60'>
										<IoFastFoodOutline className='w-4 h-4 animate-pulse' />
										Calories Consumed
										<span className='font-semibold'> {totalCals}</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className='max-w-[80vw] w-auto'>
									<LogMacrosSummary
										showPie={true}
										log={log}
										compactMode={true}
										detailedMode={true}
										useSkeleton={true}
									/>
								</PopoverContent>
							</Popover>

							<div className='flex flex-row gap-2 w-full'>
								{bmr ? (
									<div className='p-1 rounded-md border-2 items-center font-normal text-xs flex flex-col gap-0 w-16'>
										<span>BMR</span>
										<span>{formatUnit(bmr.bmr)}</span>
									</div>
								) : (
									<div className='flex flex-row gap-2'>
										<Skeleton className='w-16 h-10' />
										<Skeleton className='w-16 h-10' />
									</div>
								)}

								{calsBurned > 0 && (
									<div className='p-1 rounded-md border-2 font-normal text-xs flex flex-col gap-0 items-center w-16'>
										<span>Expended</span>
										<span>{formatUnit(calsBurned)}</span>
									</div>
								)}

								{bmr && <LogRemainderBadge />}
							</div>
						</div>
						{/*calories remaining  */}
						<div className='portrait:w-[100%]'>
							{bmr ? (
								<div
									className={cn(
										'text-2xl text-center flex flex-col items-center gap-0 relative font-bold',
										Math.sign(remainingCals) === -1
											? 'text-foreground'
											: 'text-muted-foreground'
									)}>
									<div className='font-semibold'>
										{formatUnit(remainingCals * -1)}
									</div>
									<div className='text-xs font-normal'>
										{Math.sign(remainingCals) === -1
											? 'calories remaining'
											: 'calories over'}
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
							) : (
								<div className='flex flex-col items-center justify-center w-[27vw]'>
									<FaSpinner className='w-14 h-14 animate-spin opacity-30' />
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}

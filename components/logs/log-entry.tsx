'use client';

import {
	ColatedBMRData,
	GetFoodEntry,
	GetLog,
	GetWaterConsumed
} from '@/types';
import {
	ArrowDown,
	ArrowUp,
	Calendar,
	ChartColumnBig,
	Check,
	CookingPot,
	Flame,
	Frown,
	Smile
} from 'lucide-react';

import {
	calculateWaterIntake,
	cn,
	formatUnit,
	totalMacrosReducer
} from '@/lib/utils';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { FaGlassWater } from 'react-icons/fa6';
import { IoFastFoodOutline } from 'react-icons/io5';
import { useInView } from 'react-intersection-observer';
import TruncateSection from '../truncate-section';
import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import { Separator } from '../ui/separator';
import { LogChart } from './log-chart';
import LogFoodCard from './log-food-card';
import LogMacrosSummary from './log-macros-summary';

export default function LogEntry({
	log,
	userInfo,
	waterLogs
}: {
	log: GetLog;
	userInfo?: ColatedBMRData;
	waterLogs?: GetWaterConsumed[];
}) {
	const { ref, inView } = useInView();
	const [render, setRender] = useState(false);
	const [waterLog, setWaterLog] = useState<GetWaterConsumed>();
	const [metWaterNeeds, setMetWaterNeeds] = useState(false);

	useEffect(() => {
		if (inView) {
			setRender(true);
			console.log(log);
		}
	}, [inView]);

	useEffect(() => {
		filterWaterLog();
	}, []);

	const filterWaterLog = () => {
		const dayWater = waterLogs?.filter(
			(wLog) => log.createdAt.getDate() === wLog.createdAt.getDate()
		);

		if (dayWater && dayWater.length > 0) {
			setWaterLog(dayWater[0]);

			if (userInfo) {
				const { glasses: requiredGlasses } = calculateWaterIntake(
					userInfo.weightInPounds
				);

				setMetWaterNeeds(dayWater[0].glasses >= requiredGlasses);
			}
		}
	};

	const bmrData = log.user.BaseMetabolicRate;
	const bmr = bmrData[0].bmr ? bmrData[0].bmr : 0;
	const kcBurned =
		(log.knownCaloriesBurned &&
			log.knownCaloriesBurned.length > 0 &&
			log.knownCaloriesBurned[0].calories) ||
		0;

	const { calories } = totalMacrosReducer(log.foodItems);
	const surplus = bmr + kcBurned;
	const calDiff = formatUnit(surplus - calories);
	const overUsedDailyCals = Math.sign(calDiff) === -1;

	return (
		<>
			<div
				ref={ref}
				className={cn(!render ? 'min-h-[740px]' : 'h-0')}></div>

			{!render ? null : (
				<div className='flex flex-col gap-2 animate-in fade-in duration-500'>
					<div className='flex flex-row gap-2 items-center justify-center'>
						<Calendar className='w-4 h-4 portrait:w-6 portrait:h-6  ' />
						<div className='portrait:text-sm flex flex-row items-center gap-4 justify-between flex-wrap w-full'>
							<div className='portrait:text-md font-semibold text-muted-foreground'>
								{format(log.createdAt, 'eee PP')}
							</div>
						</div>
					</div>
					<div className='flex flex-row items-center justify-start gap-8 rounded-md border-2 p-2'>
						<div className='flex flex-col items-center gap-2'>
							{waterLog && (
								<div className='flex flex-col items-center justify-center gap-0 rounded-md border-2 p-1 text-xs w-full'>
									<span className='text-muted-foreground'>Water Consumed</span>{' '}
									<div className='flex flex-row gap-1 items-center'>
										<FaGlassWater className='w-4 h-4 text-blue-600' />
										<span className='flex flex-row items-center gap-1'>
											{formatUnit(waterLog.glasses)}{' '}
											{waterLog.glasses === 1 ? 'glass' : 'glasses'}
											{metWaterNeeds ? (
												<Check className='text-green-600 w-4 h-4' />
											) : (
												<ArrowDown className='w-4 h-4 text-red-600' />
											)}
										</span>
									</div>
								</div>
							)}

							{bmr && (
								<div className='flex flex-col gap-2 text-xs'>
									<div className='flex flex-col items-center justify-center gap-0 rounded-md border-2 p-1'>
										<span className='text-muted-foreground'>
											Calories Consumed
										</span>{' '}
										<div className='flex flex-row items-center gap-1'>
											<IoFastFoodOutline className='w-4 h-4 text-green-600' />
											<span>{formatUnit(calories)}</span>
										</div>
									</div>

									<div className='flex flex-col items-center justify-center gap-0 rounded-md border-2 p-1'>
										<span className='text-muted-foreground'>
											Base Metabolic Rate
										</span>{' '}
										{formatUnit(bmr)}
									</div>

									<div className='flex flex-col items-center justify-center gap-0 rounded-md border-2 p-1'>
										<span className='text-muted-foreground'>
											Calories expended
										</span>{' '}
										<div className='flex flex-row items-center gap-1'>
											<Flame className='w-4 h-4 text-amber-600' />
											{formatUnit(kcBurned)}
										</div>
									</div>

									<div
										className={cn(
											'text-2xl font-bold w-full text-center flex flex-row items-center gap-2 justify-center',
											overUsedDailyCals
												? 'text-muted-foreground'
												: 'text-foreground'
										)}>
										{overUsedDailyCals ? (
											<ArrowUp className='w-6 h-6 text-red-600' />
										) : (
											<ArrowDown className='w-6 h-6 text-green-600' />
										)}
										{Math.abs(calDiff)}
										{overUsedDailyCals ? (
											<Frown className='w-6 h-6' />
										) : (
											<Smile className='w-6 h-6' />
										)}
									</div>

									<Dialog>
										<DialogTrigger asChild>
											<Button>
												<ChartColumnBig className='w-4 h-4' />
												View Charts
											</Button>
										</DialogTrigger>
										<DialogContent className='max-w-[65vw] min-h-[70vh] portrait:max-w-[95vw] portrait:min-h-[75vh] flex flex-col justify-start'>
											<DialogDescription></DialogDescription>
											<DialogTitle>
												{format(log.createdAt, 'eee PPP')}
											</DialogTitle>
											<LogChart log={log} />
										</DialogContent>
									</Dialog>
								</div>
							)}
						</div>

						<div className='hidden portrait:block'>
							<LogMacrosSummary
								compactMode={true}
								detailedMode={true}
								getTodayMode={false}
								log={log as GetLog}
							/>
						</div>
						<div className='portrait:hidden'>
							<LogMacrosSummary
								detailedMode={true}
								getTodayMode={false}
								log={log as GetLog}
							/>
						</div>
					</div>

					{log.foodItems.length > 1 ? (
						<>
							<div className='text-md font-semibold'>
								Food logged{' '}
								<span className='text-muted-foreground font-normal'>
									({log.foodItems.length}{' '}
									{log.foodItems.length === 1 ? 'item' : 'items'})
								</span>
							</div>
							<div className='flex flex-col items-center gap-4 w-full'>
								<TruncateSection
									allowSeeMore={true}
									label='See more'
									pixelHeight={300}>
									<div className='flex flex-col sm:grid grid-cols-2 lg:grid-cols-3 gap-4 w-full'>
										{log.foodItems
											.sort((a, b) => a.eatenAt.getTime() - b.eatenAt.getTime())
											.map((food, indx) => (
												<LogFoodCard
													indx={indx}
													key={`${food.id}-${food.eatenAt.getTime()}`}
													item={food as GetFoodEntry}
												/>
											))}
									</div>
								</TruncateSection>
							</div>
						</>
					) : log.foodItems.length === 0 ? (
						<div className='flex flex-row items-center gap-2 text-muted-foreground'>
							<CookingPot className='w-4 h-4' />
							No food was entered on this day
						</div>
					) : (
						<div className='flex portrait:flex-col md:grid grid-cols-2 flex-col gap-4'>
							{log.foodItems.map((food, indx) => (
								<LogFoodCard
									indx={indx}
									key={`${food.id}-${indx}`}
									item={food as GetFoodEntry}
								/>
							))}
						</div>
					)}

					<Separator />
					<br />
				</div>
			)}
		</>
	);
}

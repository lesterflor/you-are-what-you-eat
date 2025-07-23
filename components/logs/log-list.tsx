'use client';

import { createDailyLog, getKnownCaloriesBurned } from '@/actions/log-actions';
import { useScrolling } from '@/hooks/use-scroll';
import {
	selectPreparedDishData,
	selectPreparedDishStatus,
	setDishListState
} from '@/lib/features/dish/preparedDishSlice';
import { selectData, selectStatus } from '@/lib/features/log/logFoodSlice';
import { updateData } from '@/lib/features/user/userDataSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { cn, formatUnit, getStorageItem, setStorageItem } from '@/lib/utils';
import { BaseMetabolicRateType, GetFoodEntry, GetLog } from '@/types';
import {
	ArrowDown,
	ArrowUp,
	Flame,
	Frown,
	IdCard,
	List,
	Smile,
	Soup,
	ThumbsDown,
	ThumbsUp
} from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { GiEmptyMetalBucket } from 'react-icons/gi';
import { ImSpinner2 } from 'react-icons/im';
import { IoFastFoodOutline, IoWaterOutline } from 'react-icons/io5';
import { TbDatabaseSearch } from 'react-icons/tb';
import BMRBadge from '../bmr/bmr-badge';
import DishListSheet from '../dish/dish-list-sheet';
import FoodFavouriteListSheet from '../food-items/food-favourite-list-sheet';
import FoodListSheet from '../food-items/food-list-sheet';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Skeleton } from '../ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import CommonLoggedItems from './common-logged-items';
import ExpendedCaloriesButton from './expended-calories-button';
import LogFoodCard from './log-food-card';
import LogFoodListItem from './log-food-list-item';
import LogMacrosSummary from './log-macros-summary';
import LogRemainderBadge from './log-remainder-badge';
import WaterIntake from './water-intake';

export default function FoodLogList({
	forceColumn = true,
	useScroller = true,
	iconPosition = 'right',
	useFloaterNav = false,
	todaysLog
}: {
	useScroller?: boolean;
	iconPosition?: 'right' | 'top';
	forceColumn?: boolean;
	useFloaterNav?: boolean;
	todaysLog?: GetLog;
}) {
	const dispatch = useAppDispatch();

	const [totalCals, setTotalCals] = useState(0);
	const [logList, setLogList] = useState<GetFoodEntry[]>([]);
	const [log, setLog] = useState<GetLog>(todaysLog as GetLog);
	const [bmr, setBmr] = useState<BaseMetabolicRateType>();
	const [calsBurned, setCalsBurned] = useState(0);
	const [remainingCals, setRemainingCals] = useState(0);
	const [dataFormat, setDataFormat] = useState('');
	const [dishList, setDishList] = useState<
		{ add: boolean; item: GetFoodEntry }[]
	>([]);
	const [fetchingLog, setFetchingLog] = useTransition();

	const preparedDishData = useAppSelector(selectPreparedDishData);
	const preparedDishStatus = useAppSelector(selectPreparedDishStatus);

	useEffect(() => {
		if (
			preparedDishStatus === 'added' ||
			preparedDishStatus === 'cleared' ||
			preparedDishStatus === 'updated'
		) {
			setDishList([]);
		} else if (preparedDishStatus === 'logged') {
			getLog();
		}
	}, [preparedDishData, preparedDishStatus]);

	const { scrollingUp, delta } = useScrolling();

	const logStatus = useAppSelector(selectStatus);
	const logData = useAppSelector(selectData);

	const getLog = async () => {
		const res = await createDailyLog();
		if (res?.success && res.data) {
			parseLog(res.data as GetLog);
		}
	};

	const fetchKDC = async () => {
		const res = await getKnownCaloriesBurned();

		if (res.success && res.data) {
			setCalsBurned(res.data.calories);
		}
	};

	const setRemainingCalories = (cals: number, metRate: number) => {
		setRemainingCals(cals - (metRate + calsBurned));
	};

	useEffect(() => {
		setRemainingCalories(totalCals, bmr?.bmr ?? 0);
	}, [calsBurned]);

	useEffect(() => {
		setRemainingCalories(totalCals, bmr?.bmr ?? 0);
	}, [totalCals, bmr]);

	useEffect(() => {
		if (
			logStatus === 'added' ||
			logStatus === 'deleted' ||
			logStatus === 'updated'
		) {
			getLog();
		} else if (logStatus === 'expended calories') {
			// get expended calories
			fetchKDC();
		}
	}, [logStatus, logData]);

	useEffect(() => {
		if (dataFormat) {
			setStorageItem('logFormat', dataFormat);
		}
	}, [dataFormat]);

	useEffect(() => {
		const savedFormat = getStorageItem('logFormat') ?? 'card';
		setDataFormat(savedFormat);

		initialPageLoad();
	}, []);

	const initialPageLoad = () => {
		if (todaysLog) {
			parseLog(todaysLog);
		}
	};

	const parseLog = (log: GetLog) => {
		const {
			foodItems = [],
			totalCalories = 0,
			remainingCalories = 0,
			knownCaloriesBurned = [],
			user: { BaseMetabolicRate = [] }
		} = log;

		setFetchingLog(() => {
			setLog(log);

			setLogList(foodItems as GetFoodEntry[]);
			const bmrArr = BaseMetabolicRate;

			if (bmrArr.length > 0) {
				setBmr(bmrArr[0]);
			}

			setTotalCals(totalCalories);

			setRemainingCals(remainingCalories);

			if (knownCaloriesBurned && knownCaloriesBurned.length > 0) {
				setCalsBurned(knownCaloriesBurned[0].calories);
			}

			dispatch(
				updateData({
					bmrData: JSON.stringify(bmrArr[0]),
					caloricData: JSON.stringify({
						consumed: totalCalories,
						remaining: remainingCalories,
						burned:
							knownCaloriesBurned && knownCaloriesBurned.length > 0
								? knownCaloriesBurned[0].calories
								: 0
					})
				})
			);
		});
	};

	return (
		<>
			{logList.length > 0 && (
				<Badge
					variant={'secondary'}
					className={cn(
						'fixed right-0 top-24 z-30 transition-all duration-1000',
						scrollingUp ? '-top-24' : 'top-24',
						delta === 0 && 'top-24'
					)}>
					{logList.length > 0 && (
						<div className='flex flex-row items-center gap-2 font-normal pr-4'>
							{fetchingLog && (
								<ImSpinner2 className='animate-spin w-4 h-4 opacity-25' />
							)}
							<BiSolidFoodMenu className='w-4 h-4' />
							<div>{`Today's Log (${logList.length} ${
								logList.length === 1 ? 'item' : 'items'
							})`}</div>
						</div>
					)}

					<ToggleGroup
						variant={'outline'}
						value={dataFormat}
						onValueChange={setDataFormat}
						type='single'
						defaultValue='card'>
						<ToggleGroupItem value='list'>
							<List className='w-4 h-4' />
						</ToggleGroupItem>
						<ToggleGroupItem value='card'>
							<IdCard className='w-4 h-4' />
						</ToggleGroupItem>
					</ToggleGroup>
				</Badge>
			)}

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
						<BMRBadge />

						{calsBurned > 0 && (
							<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 font-normal text-xs flex flex-col gap-0 items-center w-16'>
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
							'transition-opacity fade-in animate-in duration-1000 text-3xl portrait:text-2xl text-center flex flex-col items-center gap-0 relative font-bold',
							Math.sign(remainingCals) === -1
								? 'text-foreground'
								: 'text-muted-foreground',
							useFloaterNav && 'hidden'
						)}>
						<div className='font-semibold'>
							{Math.abs(formatUnit(remainingCals))}
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
				<div className='flex flex-col gap-2 w-full'>
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
									{dataFormat === 'card'
										? logList.map((item, indx) => (
												<LogFoodCard
													allowEdit={true}
													indx={indx}
													item={item}
													key={`${item.id}-${item.eatenAt.getTime()}`}
												/>
										  ))
										: logList.map((item, indx) => (
												<LogFoodListItem
													onCheck={(data) => {
														// add or delete foodEntry from the dishList state

														const itemsOnly = dishList.map((item) => item.item);

														if (!itemsOnly.includes(data.item) && !!data.add) {
															const up = [...dishList];

															up.push(data);
															setDishList(up);

															dispatch(
																setDishListState({
																	id: '',
																	name: '',
																	description: '',
																	dishList: JSON.stringify(up)
																})
															);
														} else {
															const up = [...dishList];
															const flt = up.filter(
																(entry) => entry.item.id !== data.item.id
															);

															setDishList(flt);
															dispatch(
																setDishListState({
																	id: '',
																	name: '',
																	description: '',
																	dishList: JSON.stringify(flt)
																})
															);
														}
													}}
													allowEdit={true}
													indx={indx}
													item={item}
													key={`${item.id}-${item.eatenAt.getTime()}`}
												/>
										  ))}
								</>
							) : (
								<div className='flex flex-col items-center justify-center gap-2 text-muted-foreground opacity-30 fixed top-[12vh] w-[95%]'>
									<GiEmptyMetalBucket className='w-48 h-48 animate-pulse' />
									Nothing logged yet!
									<CommonLoggedItems />
								</div>
							)}
						</>
					</div>
					<br />
				</div>
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
					<CardContent className='p-2 pt-5 flex flex-row items-center gap-2 relative'>
						<div className='absolute -top-6 left-4 flex flex-row items-center justify-center gap-2.5'>
							<DishListSheet showBalloon={true}>
								<div className='rounded-full w-11 h-11 bg-fuchsia-700 p-1.5 flex flex-col items-center justify-center'>
									<Soup className='w-6 h-6 animate-pulse' />
								</div>
							</DishListSheet>

							<FoodFavouriteListSheet showBalloon={true}>
								<div className='w-11 h-11 rounded-full p-2 bg-teal-600 flex flex-col items-center justify-center mt-1'>
									<BsBookmarkStarFill className='w-6 h-6 animate-pulse' />
								</div>
							</FoodFavouriteListSheet>

							<FoodListSheet>
								<div className='rounded-full dark:bg-green-950 bg-green-500 p-3'>
									<TbDatabaseSearch className='w-6 h-6 animate-pulse' />
								</div>
							</FoodListSheet>

							<ExpendedCaloriesButton showBalloon={true}>
								<div className='mt-2 rounded-full p-2 bg-amber-700 w-10 h-10 flex flex-col items-center justify-center'>
									<Flame className='w-6 h-6 animate-pulse' />
								</div>
							</ExpendedCaloriesButton>

							<WaterIntake showBalloon={true}>
								<div className='mt-2 rounded-full p-2 bg-blue-700 w-10 h-10 flex flex-col items-center justify-center'>
									<IoWaterOutline className='w-6 h-6 animate-pulse' />
								</div>
							</WaterIntake>
						</div>

						<div className={cn('flex flex-col items-start w-full gap-1')}>
							<Popover modal={true}>
								<PopoverTrigger asChild>
									<Button className='p-1 portrait:text-sm flex flex-row gap-2 w-60'>
										<IoFastFoodOutline className='w-4 h-4 animate-pulse' />
										Calories Consumed
										<span className='font-semibold'> {totalCals}</span>
									</Button>
								</PopoverTrigger>
								<PopoverContent className='max-w-[90vw] w-auto'>
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
								<BMRBadge />

								{calsBurned > 0 && (
									<div className='transition-opacity fade-in animate-in duration-1000 p-1 rounded-md border-2 font-normal text-xs flex flex-col gap-0 items-center w-16'>
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
										'transition-opacity fade-in animate-in duration-1000 text-2xl text-center flex flex-col items-center gap-0 relative font-bold',
										Math.sign(remainingCals) === -1
											? 'text-foreground'
											: 'text-muted-foreground'
									)}>
									<div className='font-semibold'>
										{Math.abs(formatUnit(remainingCals))}
									</div>
									<div className='text-xs font-normal'>
										{Math.sign(remainingCals) === -1
											? 'calories remaining'
											: 'calories over'}
									</div>
									{totalCals > 0 && (
										<div
											className={cn(
												'absolute flex flex-row items-center gap-0',
												iconPosition === 'top'
													? '-top-6 right-2'
													: 'top-4 -right-6'
											)}>
											{Math.sign(remainingCals) === -1 ? (
												<>
													<ArrowDown className='w-6 h-6 text-green-600 animate-bounce' />
													<Smile className='w-6 h-6' />
												</>
											) : (
												<>
													<ArrowUp className='w-6 h-6 text-red-600 animate-bounce' />
													<Frown className='w-6 h-6' />
												</>
											)}
										</div>
									)}
								</div>
							) : (
								<div className='flex flex-col items-center justify-center w-[25vw]'>
									<ImSpinner2 className='w-10 h-10 animate-spin opacity-25' />
								</div>
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</>
	);
}

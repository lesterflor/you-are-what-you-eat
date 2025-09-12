'use client';

import { useScrolling } from '@/hooks/use-scroll';
import {
	selectPreparedDishData,
	selectPreparedDishStatus,
	setDishListState
} from '@/lib/features/dish/preparedDishSlice';
import {
	reset,
	selectCurrentDishItems,
	selectData,
	selectDeletedItem,
	selectLog,
	selectMacros,
	selectStatus,
	selectUpdatedItem,
	setCurrentLog
} from '@/lib/features/log/logFoodSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { cn, getStorageItem, setStorageItem } from '@/lib/utils';
import { GetFoodEntry, GetLog } from '@/types';
import { Flame, IdCard, List, LucideUtensilsCrossed, Soup } from 'lucide-react';
import {
	lazy,
	Suspense,
	useEffect,
	useMemo,
	useState,
	useTransition
} from 'react';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';
import { IoFastFoodOutline, IoWaterOutline } from 'react-icons/io5';
import { TbDatabaseSearch } from 'react-icons/tb';
import SubToolsSkeleton from '../skeletons/sub-tools-skeleton';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Skeleton } from '../ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import ExpendedBadge from './expended-badge';
import LogFoodCard from './log-food-card';
import LogFoodListItem from './log-food-list-item';
import LogMacrosSummary from './log-macros-summary';
import RemainingCalories from './remaining-calories';

const LogRemainderBadgeLazy = lazy(
	() => import('@/components/logs/log-remainder-badge')
);

const BMRBadgeLazy = lazy(() => import('@/components/bmr/bmr-badge'));

const CommonLoggedItemsLazy = lazy(
	() => import('@/components/logs/common-logged-items')
);

const FoodListSheetLazy = lazy(
	() => import('@/components/food-items/food-list-sheet')
);

const DishListSheetLazy = lazy(
	() => import('@/components/dish/dish-list-sheet')
);

const FoodFavouriteListSheetLazy = lazy(
	() => import('@/components/food-items/food-favourite-list-sheet')
);

const ExpendedCaloriesButtonLazy = lazy(
	() => import('@/components/logs/expended-calories-button')
);

const WaterIntakeLazy = lazy(() => import('./water-intake'));

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

	const [logList, setLogList] = useState<GetFoodEntry[]>(
		todaysLog?.foodItems || []
	);
	const [log, setLog] = useState<GetLog>(todaysLog as GetLog);
	const [dataFormat, setDataFormat] = useState('');
	const [dishList, setDishList] = useState<
		{ add: boolean; item: GetFoodEntry }[]
	>([]);
	const [fetchingLog, setFetchingLog] = useTransition();

	const preparedDishData = useAppSelector(selectPreparedDishData);
	const preparedDishStatus = useAppSelector(selectPreparedDishStatus);
	const logStatus = useAppSelector(selectStatus);
	const logData = useAppSelector(selectData);
	const logDataLog = useAppSelector(selectLog);
	const logDataDeleted = useAppSelector(selectDeletedItem);
	const logDataUpdated = useAppSelector(selectUpdatedItem);
	const logDataCurrentDish = useAppSelector(selectCurrentDishItems);
	const logDataMacros = useAppSelector(selectMacros);

	useEffect(() => {
		if (
			preparedDishStatus === 'added' ||
			preparedDishStatus === 'cleared' ||
			preparedDishStatus === 'updated'
		) {
			setDishList([]);
		} else if (preparedDishStatus === 'logged') {
			parseLog(JSON.parse(preparedDishData.log || '{}'));
		}
	}, [preparedDishData, preparedDishStatus]);

	const { scrollingUp, delta } = useScrolling();

	const resetLogState = () => {
		// reset slice as navigation changes will persist added state
		dispatch(reset());
	};

	useEffect(() => {
		if (logStatus === 'updated') {
			const update = [...logList].map((item) => {
				if (logDataUpdated && item.id === logDataUpdated.id) {
					return {
						...item,
						numServings: logDataUpdated.numServings
					};
				}
				return item;
			});

			setLogList(update);

			resetLogState();
		} else if (logStatus === 'deleted') {
			setLogList((prev) => {
				return prev.filter((item) => item.id !== logDataDeleted?.id);
			});

			resetLogState();
		} else if (logStatus === 'added') {
			setLogList((prev) => {
				if (
					logDataLog &&
					logDataLog.foodItems &&
					logDataLog.foodItems?.length > 0
				) {
					const item = {
						...logDataLog.foodItems[logDataLog.foodItems.length - 1]
					};

					const update = {
						...item,
						description: item.description ?? '',
						image: item.image ?? '',
						eatenAt: item.eatenAt ? new Date(item.eatenAt) : new Date()
					};

					return [update, ...prev];
				}
				return prev;
			});

			resetLogState();
		} else if (
			logStatus === 'loggedDish' &&
			logDataCurrentDish &&
			logDataCurrentDish?.length > 0
		) {
			const updates = logDataCurrentDish.map((item) => ({
				...item,
				description: item.description ?? '',
				image: item.image ?? '',
				eatenAt: item.eatenAt ? new Date(item.eatenAt) : new Date()
			}));

			setLogList((prev) => updates.concat(...prev));

			resetLogState();
		}
	}, [
		logStatus,
		logData,
		logDataLog,
		logDataDeleted,
		logDataUpdated,
		logDataCurrentDish
	]);

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
			dispatch(setCurrentLog(JSON.stringify(todaysLog)));
			parseLog(todaysLog);
		}
	};

	const parseLog = (log: GetLog, ignoreLogList: boolean = false) => {
		const { foodItems = [] } = log;

		setFetchingLog(() => {
			setLog(log);

			if (!ignoreLogList) {
				setLogList(foodItems as GetFoodEntry[]);
			}
		});
	};

	const logFoodCards = useMemo(() => {
		return logList.map((item, indx) => (
			<LogFoodCard
				allowEdit={true}
				indx={indx}
				item={item}
				key={`${item.id}-${new Date(item.eatenAt).getTime()}`}
			/>
		));
	}, [logList]);

	const logListItems = useMemo(() => {
		return logList.map((item, indx) => (
			<LogFoodListItem
				onCheck={(data) => {
					// add or delete foodEntry from the dishList state

					const itemsOnly = dishList.map((item) => item.item);

					if (!itemsOnly.includes(data.item) && !!data.add) {
						const up = [...dishList, data];

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
						const flt = up.filter((entry) => entry.item.id !== data.item.id);

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
				key={`${item.id}-${new Date(item.eatenAt).getTime()}`}
			/>
		));
	}, [logList, dishList]);

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
						className='rounded-md'
						variant={'default'}
						value={dataFormat}
						onValueChange={setDataFormat}
						type='single'
						defaultValue='card'>
						<ToggleGroupItem
							value='list'
							className='data-[state=on]:bg-green-500/10'>
							<List className='w-4 h-4' />
						</ToggleGroupItem>
						<ToggleGroupItem
							value='card'
							className='data-[state=on]:bg-green-500/10'>
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
								<span className='font-semibold'>
									{' '}
									{logDataMacros.caloriesConsumed}
								</span>
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
						<Suspense fallback={<Skeleton className='w-16 h-10' />}>
							<BMRBadgeLazy />
						</Suspense>

						<ExpendedBadge />

						<Suspense fallback={<Skeleton className='w-full h-full' />}>
							<LogRemainderBadgeLazy />
						</Suspense>
					</div>
				</div>

				{logDataMacros.caloriesRemaining ? (
					<>
						{!useFloaterNav && (
							<RemainingCalories iconPosition={iconPosition} />
						)}
					</>
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
								<>{dataFormat === 'card' ? logFoodCards : logListItems}</>
							) : (
								<div className='flex flex-col items-center justify-center gap-2 text-muted-foreground  fixed top-[16vh] w-[95%]'>
									<div className='flex flex-col items-center gap-2 opacity-35'>
										<LucideUtensilsCrossed className='w-32 h-32 animate-pulse ' />
										Nothing logged yet!
									</div>

									<CommonLoggedItemsLazy />
								</div>
							)}
						</>
					</div>
					<br />
				</div>
			) : (
				<div className='flex flex-col gap-4 w-full'>
					<div className='flex flex-col gap-4'>{logFoodCards}</div>
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
							<Suspense fallback={<SubToolsSkeleton />}>
								<DishListSheetLazy showBalloon={true}>
									<div className='transition-opacity fade-in animate-in duration-1000 rounded-full w-11 h-11 bg-fuchsia-700 p-1.5 flex flex-col items-center justify-center'>
										<Soup className='w-6 h-6 animate-pulse' />
									</div>
								</DishListSheetLazy>

								<FoodFavouriteListSheetLazy showBalloon={true}>
									<div className='transition-opacity fade-in animate-in duration-1000 w-11 h-11 rounded-full p-2 bg-teal-600 flex flex-col items-center justify-center mt-1'>
										<BsBookmarkStarFill className='w-6 h-6 animate-pulse' />
									</div>
								</FoodFavouriteListSheetLazy>

								<FoodListSheetLazy>
									<div className='transition-opacity fade-in animate-in duration-1000 rounded-full dark:bg-green-950 bg-green-500 p-3'>
										<TbDatabaseSearch className='w-6 h-6 animate-pulse' />
									</div>
								</FoodListSheetLazy>

								<ExpendedCaloriesButtonLazy showBalloon={true}>
									<div className='transition-opacity fade-in animate-in duration-1000 mt-2 rounded-full p-2 bg-amber-700 w-10 h-10 flex flex-col items-center justify-center'>
										<Flame className='w-6 h-6 animate-pulse' />
									</div>
								</ExpendedCaloriesButtonLazy>

								<WaterIntakeLazy showBalloon={true}>
									<div className='transition-opacity fade-in animate-in duration-1000 mt-2 rounded-full p-2 bg-blue-700 w-10 h-10 flex flex-col items-center justify-center'>
										<IoWaterOutline className='w-6 h-6 animate-pulse' />
									</div>
								</WaterIntakeLazy>
							</Suspense>
						</div>

						<div className={cn('flex flex-col items-start w-full gap-1')}>
							<Popover modal={true}>
								<PopoverTrigger asChild>
									<Button className='p-1 portrait:text-sm flex flex-row gap-2 w-60'>
										<IoFastFoodOutline className='w-4 h-4 animate-pulse' />
										Calories Consumed
										<span className='font-semibold'>
											{' '}
											{logDataMacros.caloriesConsumed}
										</span>
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
								<Suspense fallback={<Skeleton className='w-16 h-10' />}>
									<BMRBadgeLazy />
								</Suspense>

								<ExpendedBadge />

								<Suspense fallback={<Skeleton className='w-full h-full' />}>
									<LogRemainderBadgeLazy />
								</Suspense>
							</div>
						</div>
						<RemainingCalories iconPosition={iconPosition} />
					</CardContent>
				</Card>
			)}
		</>
	);
}

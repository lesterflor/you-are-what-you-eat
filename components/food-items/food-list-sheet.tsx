'use client';

import {
	compareLocalFoods,
	getFavouriteFoods,
	getFoodItems
} from '@/actions/food-actions';
import {
	inputSearch,
	selectFoodSearchData,
	selectFoodSearchStatus
} from '@/lib/features/food/foodSearchSlice';
import {
	selectFoodUpdateData,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { cn, getStorageItem, setStorageItem } from '@/lib/utils';
import { GetFoodItem } from '@/types';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { BsCloudCheck } from 'react-icons/bs';
import { ImSpinner2, ImSpinner8, ImSpinner9 } from 'react-icons/im';
import { TbDatabaseSearch } from 'react-icons/tb';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from 'use-debounce';
import DishCreationPopover from '../dish/dish-creation-popover';
import InputWithButton from '../input-with-button';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import FoodCategoryPicker from './food-categories';
import FoodItemCard from './food-item-card';

export default function FoodListSheet({
	forceColumn = true,
	children
}: {
	forceColumn?: boolean;
	children?: React.ReactNode;
}) {
	const [foods, setFoods] = useState<GetFoodItem[]>([]);
	const [allFoods, setAllFoods] = useState<GetFoodItem[]>([]);

	const dispatch = useAppDispatch();
	const foodUpdateData = useAppSelector(selectFoodUpdateData);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

	const foodSearchData = useAppSelector(selectFoodSearchData);
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);

	const [ref, inView] = useInView();
	const [upToDate, setUpToDate] = useState(true);

	useEffect(() => {
		if (inView) {
			setTimeout(checkLocalFoods, 1500);
		}
	}, [inView]);

	const [isSyncing, setIsSyncing] = useTransition();

	const checkLocalFoods = () => {
		setIsSyncing(async () => {
			const res = await compareLocalFoods(allFoods);

			setUpToDate(res.success);

			if (res.success && res.data) {
				setIsSyncing(() => {
					setStorageItem('foodList', res.data);
					setAllFoods(res.data as GetFoodItem[]);
					setFoods(res.data as GetFoodItem[]);
				});
			}
		});
	};

	useEffect(() => {
		// on mount get all foods and do local sorting in redux handler
		const savedFoods: GetFoodItem[] = getStorageItem('foodList') || [];

		if (savedFoods.length > 0) {
			setIsFetching(() => {
				setAllFoods(savedFoods);

				checkFoodStatus(foodSearchStatus);
			});
		} else {
			getFoods();
		}
	}, []);

	const checkFoodStatus = (status: string) => {
		const items = [...allFoods];

		switch (status) {
			case 'category':
				//getFoods('', foodSearchData.category);

				const update = items.filter(
					(item) => item.category === foodSearchData.category
				);
				setFoods(update);

				break;
			case 'user':
				//getFoods('', '', foodSearchData.user);

				const userFoods = items.filter(
					(item) => item.userId === foodSearchData.user
				);
				setFoods(userFoods);

				break;
			case 'all':
				//getFoods();
				setFoods(items);

				break;
			case 'input':
				//getFoods(foodSearchData.term ?? '');
				const term = foodSearchData.term
					? foodSearchData.term.toLowerCase()
					: '';

				const searchFoods = items.filter((item) =>
					item.name.toLowerCase().includes(term)
				);

				setFoods(searchFoods);
				break;
			case 'favourites':
				getFavs();
				break;
		}
	};

	// redux handler
	useEffect(() => {
		checkFoodStatus(foodSearchStatus);
	}, [foodSearchStatus, foodSearchData]);

	const [isFetching, setIsFetching] = useTransition();

	const getFoods = (term: string = '', cat: string = '', user = '') => {
		setIsFetching(async () => {
			const res = await getFoodItems(term, cat, user);

			if (res.success && res.data) {
				setAllFoods(res.data as GetFoodItem[]);
				checkFoodStatus(foodSearchStatus);
				//setFoods(res.data as GetFoodItem[]);

				setStorageItem('foodList', res.data);
			}
		});
	};

	const getFavs = () => {
		setIsFetching(async () => {
			const res = await getFavouriteFoods();

			if (res.success && res.data) {
				setFoods(res.data as GetFoodItem[]);
			}
		});
	};

	const [search, setSearch] = useState('');
	const [debounced] = useDebounce(search, 1000);

	useEffect(() => {
		if (debounced) {
			dispatch(inputSearch(debounced));
		} else {
			setFoods(allFoods);
		}
	}, [debounced]);

	useEffect(() => {
		scrollToTop();
	}, [foods]);

	useEffect(() => {
		if (foodUpdateStatus !== 'idle') {
			getFoods();
		}
	}, [foodUpdateData, foodUpdateStatus]);

	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const scrollAreaRefD = useRef<HTMLDivElement>(null);

	const scrollToTop = () => {
		if (scrollAreaRef.current) {
			scrollAreaRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}

		if (scrollAreaRefD.current) {
			scrollAreaRefD.current.scrollIntoView({
				behavior: 'smooth',
				block: 'start'
			});
		}
	};

	return (
		<>
			<div className='portrait:hidden'>
				<Sheet>
					<SheetTrigger
						asChild
						disabled={isFetching}>
						{children ? (
							<div
								className={cn('relative', isFetching && 'pointer-events-none')}>
								{children}
								{isFetching && (
									<div className='absolute w-auto h-4 rounded-full bg-gray-500 text-xs top-0 right-0 p-1 flex items-center justify-center'>
										<ImSpinner9 className='animate-spin' />
									</div>
								)}
							</div>
						) : (
							<Button>
								<TbDatabaseSearch className='w-4 h-4' /> Search
							</Button>
						)}
					</SheetTrigger>
					<SheetContent side='right'>
						<SheetDescription></SheetDescription>
						<SheetTitle className='flex flex-col items-center gap-2 pb-4 relative'>
							<div
								className={cn(
									'absolute rounded-full -top-4 -left-1 p-1',
									upToDate ? 'bg-green-800' : 'bg-red-800'
								)}>
								{isSyncing ? (
									<ImSpinner8 className='animate-spin' />
								) : (
									<Popover>
										<PopoverTrigger asChild>
											<BsCloudCheck />
										</PopoverTrigger>
										<PopoverContent className='flex flex-col items-center justify-center gap-3'>
											<div>
												<BsCloudCheck
													className={cn(
														upToDate ? 'text-green-600 w-6 h-6' : 'text-red-600'
													)}
												/>
												{upToDate
													? 'Food list is up to date'
													: 'Food list needs updating'}
											</div>

											{!upToDate && (
												<div>
													<Button onClick={() => checkLocalFoods()}>
														Sync
													</Button>
												</div>
											)}
										</PopoverContent>
									</Popover>
								)}
							</div>
							<div
								className='flex flex-row gap-2 justify-between items-center pt-2'
								ref={ref}>
								<InputWithButton
									className='w-[90%]'
									onChange={(val) => {
										setSearch(val);
									}}>
									<Search className='w-4 h-4 text-muted-foreground' />
								</InputWithButton>
								<div className='text-xs font-normal'>
									{foods.length} {foods.length === 1 ? 'result' : 'results'}
								</div>
							</div>
							<FoodCategoryPicker
								showFilterIcon={true}
								iconsOnly={true}
								onSelect={() => {}}
								compactMode={true}
							/>
						</SheetTitle>
						<ScrollArea className='h-[80vh] w-full pr-0'>
							<div
								ref={scrollAreaRefD}
								className={cn(
									'gap-4 pb-5 w-[97%]',
									forceColumn
										? 'flex flex-col'
										: 'grid grid-cols-2 lg:grid-cols-3'
								)}>
								{foods && foods.length > 0 ? (
									foods.map((item, indx) => (
										<FoodItemCard
											indx={indx}
											item={item as GetFoodItem}
											key={item.id}
											selfSearch={true}
										/>
									))
								) : (
									<div className='w-full text-center text-muted-foreground font-normal'>
										There are no results for the search you provided.
									</div>
								)}
							</div>
						</ScrollArea>
					</SheetContent>
				</Sheet>
			</div>

			<div className='hidden portrait:block'>
				<Sheet>
					<SheetTrigger
						asChild
						disabled={isFetching}>
						{children ? (
							<div
								className={cn('relative', isFetching && 'pointer-events-none')}>
								{children}
								{isFetching && (
									<div className='absolute w-auto h-4 rounded-full bg-gray-500 text-xs top-0 right-0 p-1 flex items-center justify-center'>
										<ImSpinner9 className='animate-spin' />
									</div>
								)}
							</div>
						) : (
							<Button>
								{isFetching ? (
									<ImSpinner9 className='animate-spin' />
								) : (
									<TbDatabaseSearch />
								)}
								Search
							</Button>
						)}
					</SheetTrigger>
					<SheetTitle />
					<SheetContent
						side='top'
						className='px-2'>
						<div className='flex flex-col items-center gap-4 pb-4 relative top-3'>
							<div
								className={cn(
									'absolute rounded-full -top-6 -left-1 p-1',
									upToDate ? 'bg-green-800' : 'bg-red-800'
								)}>
								{isSyncing ? (
									<ImSpinner8 className='animate-spin' />
								) : (
									<Popover>
										<PopoverTrigger asChild>
											<BsCloudCheck />
										</PopoverTrigger>
										<PopoverContent className='flex flex-col items-center justify-center gap-3'>
											<div className='flex flex-row gap-2'>
												<BsCloudCheck
													className={cn(
														upToDate ? 'text-green-600 w-6 h-6' : 'text-red-600'
													)}
												/>
												{upToDate
													? 'Food list is up to date'
													: 'Food list needs updating'}
											</div>

											{!upToDate && (
												<div>
													<Button onClick={() => checkLocalFoods()}>
														Sync
													</Button>
												</div>
											)}
										</PopoverContent>
									</Popover>
								)}
							</div>

							<div
								className='flex flex-row gap-2 justify-between items-center mt-4'
								ref={ref}>
								<div className='flex flex-row items-center gap-4'>
									<InputWithButton
										className='w-[60%]'
										onChange={(val) => {
											setSearch(val);
										}}>
										<Search className='w-4 h-4 text-muted-foreground' />
									</InputWithButton>

									<div className='text-xs font-normal'>
										{foods.length} {foods.length === 1 ? 'result' : 'results'}
									</div>

									{isFetching && (
										<div>
											<ImSpinner2 className='w-4 h-4 animate-spin opacity-25' />
										</div>
									)}
								</div>

								<DishCreationPopover />
							</div>

							<FoodCategoryPicker
								value='all'
								showFilterIcon={true}
								iconsOnly={true}
								onSelect={() => {}}
								compactMode={true}
							/>
						</div>
						<SheetDescription></SheetDescription>
						<ScrollArea className='h-[70vh] w-[100%] pt-4'>
							<div
								ref={scrollAreaRef}
								className={cn(
									'gap-4 pb-5 w-[97%]',
									forceColumn
										? 'flex flex-col items-center justify-center'
										: 'grid grid-cols-2'
								)}>
								{foods && foods.length > 0 ? (
									foods.map((item, indx) => (
										<FoodItemCard
											indx={indx}
											item={item as GetFoodItem}
											key={item.id}
											selfSearch={true}
										/>
									))
								) : (
									<div className='w-full text-center text-muted-foreground font-normal'>
										There are no results for the search you provided.
									</div>
								)}
							</div>
						</ScrollArea>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}

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
import { useEffect, useRef, useState } from 'react';
import { BsCloudCheck } from 'react-icons/bs';
import { ImSpinner2, ImSpinner8, ImSpinner9 } from 'react-icons/im';
import { TbDatabaseSearch } from 'react-icons/tb';
import { useInView } from 'react-intersection-observer';
import { useDebounce } from 'use-debounce';
import DishCreationPopover from '../dish/dish-creation-popover';
import InputWithButton from '../input-with-button';
import { Button } from '../ui/button';
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

	const [isSyncing, setIsSyncing] = useState(false);

	const checkLocalFoods = async () => {
		setIsSyncing(true);
		const res = await compareLocalFoods(allFoods);

		setUpToDate(res.success);

		if (!res.success) {
			setAllFoods(res.data as GetFoodItem[]);
		}

		setIsSyncing(false);
	};

	useEffect(() => {
		// on mount get all foods and do local sorting in redux handler
		const savedFoods: GetFoodItem[] = getStorageItem('foodList') || [];

		if (savedFoods.length > 0) {
			setAllFoods(savedFoods);
			if (foods.length === 0) {
				setFoods(savedFoods);
			}
			setIsFetching(false);
		} else {
			getFoods();
		}
	}, []);

	// redux handler
	useEffect(() => {
		const items = [...allFoods];

		switch (foodSearchStatus) {
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
				getFoods(foodSearchData.term ?? '');
				break;
			case 'favourites':
				getFavs();
				break;
			// case 'idle':
			// 	getFoods();
			// 	break;
		}
	}, [foodSearchStatus, foodSearchData]);

	const [isFetching, setIsFetching] = useState(true);

	const getFoods = async (term: string = '', cat: string = '', user = '') => {
		setIsFetching(true);
		const res = await getFoodItems(term, cat, user);

		if (res.success && res.data) {
			if (!term && !cat && !user) {
				setAllFoods(res.data as GetFoodItem[]);
				if (foods.length === 0) {
					setFoods(res.data as GetFoodItem[]);
				}
			} else {
				setFoods(res.data as GetFoodItem[]);
			}

			setStorageItem('foodList', res.data);
		}

		setIsFetching(false);
	};

	const getFavs = async () => {
		setIsFetching(true);
		const res = await getFavouriteFoods();

		if (res.success && res.data) {
			setFoods(res.data as GetFoodItem[]);
		}

		setIsFetching(false);
	};

	const [search, setSearch] = useState('');
	const [debounced] = useDebounce(search, 1000);

	useEffect(() => {
		if (debounced) {
			dispatch(inputSearch(debounced));
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
							<div className='relative'>
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
									<BsCloudCheck />
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
							<div className='relative'>
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
					<SheetContent
						side='top'
						className='px-2'>
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
									<BsCloudCheck />
								)}
							</div>

							<div
								className='flex flex-row gap-2 justify-between items-center pt-2'
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
						</SheetTitle>
						<ScrollArea className='h-[70vh] w-[100%]'>
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

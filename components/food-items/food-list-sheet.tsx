'use client';

import { getFavouriteFoods, getFoodItems } from '@/actions/food-actions';
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
import { cn } from '@/lib/utils';
import { GetFoodItem } from '@/types';
import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TbDatabaseSearch } from 'react-icons/tb';
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

	useEffect(() => {
		// on mount get all foods and do local sorting in redux handler
		getFoods();
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
		}
	}, [foodSearchStatus, foodSearchData]);

	const [isFetching, setIsFetching] = useState(true);

	const getFoods = async (term: string = '', cat: string = '', user = '') => {
		setIsFetching(true);
		const res = await getFoodItems(term, cat, user);

		if (res.success && res.data) {
			setFoods(res.data as GetFoodItem[]);

			if (!term && !cat && !user) {
				setAllFoods(res.data as GetFoodItem[]);
			}
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
					<SheetTrigger asChild>
						{children ? (
							children
						) : (
							<Button>
								<TbDatabaseSearch className='w-4 h-4' /> Search
							</Button>
						)}
					</SheetTrigger>
					<SheetContent side='right'>
						<SheetDescription></SheetDescription>
						<SheetTitle className='flex flex-col items-center gap-2 pb-4'>
							<div className='flex flex-row gap-2 justify-between items-center pt-2'>
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
					<SheetTrigger asChild>
						{children ? (
							children
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
						<SheetTitle className='flex flex-col items-center gap-2 pb-4'>
							<div className='flex flex-row gap-2 justify-between items-center pt-2'>
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

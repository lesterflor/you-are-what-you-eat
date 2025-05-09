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
import { FaSpinner } from 'react-icons/fa';
import { useDebounce } from 'use-debounce';
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

	const dispatch = useAppDispatch();
	const foodUpdateData = useAppSelector(selectFoodUpdateData);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

	const foodSearchData = useAppSelector(selectFoodSearchData);
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);

	// redux handler
	useEffect(() => {
		switch (foodSearchStatus) {
			case 'category':
				getFoods('', foodSearchData.category);
				break;
			case 'user':
				getFoods('', '', foodSearchData.user);
				break;
			case 'all':
				getFoods();
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

	// useEffect(() => {
	// 	getFavs();
	// }, []);

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
								<Search className='w-4 h-4' /> Search
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
								<Search className='w-4 h-4' /> Search
							</Button>
						)}
					</SheetTrigger>
					<SheetContent
						side='top'
						className='px-2'>
						<SheetDescription></SheetDescription>
						<SheetTitle className='flex flex-col items-center gap-2 pb-4'>
							<div className='flex flex-row gap-2 justify-between items-center pt-2'>
								<InputWithButton
									className='w-[70%]'
									onChange={(val) => {
										setSearch(val);
									}}>
									<Search className='w-4 h-4 text-muted-foreground' />
								</InputWithButton>

								{isFetching && (
									<div>
										<FaSpinner className='w-4 h-4 animate-spin' />
									</div>
								)}

								<div className='text-xs font-normal'>
									{foods.length} {foods.length === 1 ? 'result' : 'results'}
								</div>
							</div>

							<FoodCategoryPicker
								value='favourites'
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

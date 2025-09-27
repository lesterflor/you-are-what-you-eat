'use client';

import {
	clearCategories,
	inputSearch,
	selectFoodSearchData,
	selectFoodSearchStatus
} from '@/lib/features/food/foodSearchSlice';
import { selectFoodUpdateStatus } from '@/lib/features/food/foodUpdateSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { getFavouriteQueryOptions } from '@/lib/queries/favouriteQueries';
import { getFoodQueryOptions } from '@/lib/queries/foodQueries';
import { cn, isNewFoodItem } from '@/lib/utils';
import { GetFoodItem } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
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
import NewItemsBadge from './new-items-badge';

const FoodListSheet = memo(function FoodListSheet({
	forceColumn = true,
	children,
	showBalloon = false
}: {
	forceColumn?: boolean;
	children?: React.ReactNode;
	showBalloon?: boolean;
}) {
	const {
		data: foodsData,
		refetch,
		isFetching
	} = useQuery(getFoodQueryOptions());
	const { data: foodFavs } = useQuery(getFavouriteQueryOptions());

	const [foods, setFoods] = useState<GetFoodItem[]>([]);
	const [allFoods, setAllFoods] = useState<GetFoodItem[]>([]);
	const [search, setSearch] = useState('');
	const [debounced] = useDebounce(search, 1000);

	const scrollAreaRef = useRef<HTMLDivElement>(null);
	const scrollAreaRefD = useRef<HTMLDivElement>(null);

	const dispatch = useAppDispatch();

	const foodSearchData = useAppSelector(selectFoodSearchData);
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

	// redux handler
	useEffect(() => {
		checkFoodStatus(foodSearchStatus);
	}, [foodSearchStatus, foodSearchData]);

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
		setAllFoods(foodsData as GetFoodItem[]);
		setFoods(foodsData as GetFoodItem[]);

		// refetch again since initialData is stale from local storage (max size reached)
		console.log('mount refetch');
		refetch();
	}, []);

	useEffect(() => {
		if (foodsData) {
			setAllFoods(foodsData as GetFoodItem[]);
			checkFoodStatus(foodSearchStatus);
		}
	}, [foodsData]);

	useEffect(() => {
		if (foodUpdateStatus === 'deleted' && foodSearchStatus === 'cleared') {
			checkFoodStatus(foodSearchStatus);
		}
	}, [foodUpdateStatus, foodSearchStatus]);

	const checkFoodStatus = (status: string) => {
		switch (status) {
			case 'category':
				setFoods(
					foodsData?.filter(
						(item) => item.category === foodSearchData.category
					) ?? []
				);
				break;
			case 'user':
				setFoods(
					foodsData?.filter((item) => item.userId === foodSearchData.user) ?? []
				);
				break;
			case 'all':
				setFoods(foodsData ?? []);
				break;
			case 'input':
				const term = foodSearchData.term
					? foodSearchData.term.toLowerCase()
					: '';

				const searchFoods = foodsData?.filter((item) =>
					item.name.toLowerCase().includes(term)
				);

				setFoods(searchFoods as GetFoodItem[]);
				break;
			case 'favourites':
				if (foodFavs) {
					setFoods(foodFavs);
				}

				break;
			case 'cleared': // clears all categories and returns new items
				setFoods(
					foodsData?.filter((item) => isNewFoodItem(item.createdAt)) ?? []
				);
				break;
		}
	};

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

	const foodListComponents = useMemo(
		() =>
			foods &&
			foods.map((item, indx) => (
				<FoodItemCard
					indx={indx}
					item={item as GetFoodItem}
					key={item.id}
					selfSearch={true}
				/>
			)),
		[foods, foodsData]
	);

	const NewItemsBadgeMemo = useMemo(
		() => (
			<NewItemsBadge
				onBadgeClick={() => {
					dispatch(clearCategories());
				}}
			/>
		),
		[]
	);

	return (
		<>
			<div className='portrait:hidden'>
				<Sheet>
					<SheetTrigger asChild>
						{children ? (
							<div className='relative'>
								{children}
								{isFetching ? (
									<div>
										<ImSpinner2 className='w-4 h-4 animate-spin text-muted-foreground' />
									</div>
								) : (
									showBalloon &&
									foodsData &&
									foodsData.length > 0 && (
										<div className='transition-opacity fade-in animate-in duration-1000 absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
											{foodsData?.length}
										</div>
									)
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
							{NewItemsBadgeMemo}
							<div className='flex flex-row gap-2 justify-between items-center pt-2'>
								<InputWithButton
									className='w-[90%]'
									onChange={(val) => {
										setSearch(val);
									}}>
									<Search className='w-4 h-4 text-muted-foreground' />
								</InputWithButton>

								{foods && (
									<div className='text-xs font-normal flex flex-row gap-2'>
										{foods.length} {foods.length === 1 ? 'result' : 'results'}
										{isFetching && (
											<ImSpinner2 className='text-muted-foreground w-4 h-4 animate-spin' />
										)}
									</div>
								)}
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
									foodListComponents
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
							<div className='relative'>
								{children}
								{isFetching ? (
									<div className='absolute top-0 right-0'>
										<ImSpinner2 className='w-4 h-4 animate-spin text-muted-foreground' />
									</div>
								) : (
									showBalloon &&
									foodsData &&
									foodsData.length > 0 && (
										<div className='transition-opacity fade-in animate-in duration-1000 absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
											{foodsData?.length}
										</div>
									)
								)}
							</div>
						) : (
							<Button>
								<TbDatabaseSearch />
								Search
							</Button>
						)}
					</SheetTrigger>
					<SheetTitle />
					<SheetContent
						side='top'
						className='px-2'>
						<div className='flex flex-col items-center gap-4 pb-4 relative top-3'>
							<div className='absolute -top-6 left-0'>{NewItemsBadgeMemo}</div>
							<div className='flex flex-row gap-2 justify-between items-center mt-4'>
								<div className='flex flex-row items-center gap-4'>
									<InputWithButton
										className='w-[60%]'
										onChange={(val) => {
											setSearch(val);
										}}>
										<Search className='w-4 h-4 text-muted-foreground' />
									</InputWithButton>

									{foods && (
										<div className='text-xs font-normal flex flex-row gap-2'>
											{foods.length} {foods.length === 1 ? 'result' : 'results'}
											{isFetching && (
												<ImSpinner2 className='text-muted-foreground w-4 h-4 animate-spin' />
											)}
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
									foodListComponents
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
});

export default FoodListSheet;

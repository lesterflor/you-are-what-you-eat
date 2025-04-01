'use client';

import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import { useContext, useEffect, useRef, useState } from 'react';
import { GetFoodItem } from '@/types';
import { getFoodItems } from '@/actions/food-actions';
import FoodItemCard from './food-item-card';
import { ScrollArea } from '../ui/scroll-area';
import { useDebounce } from 'use-debounce';
import InputWithButton from '../input-with-button';
import FoodCategoryPicker from './food-categories';
import { FoodSearchContext } from '@/contexts/food-search-context';
import { cn } from '@/lib/utils';
import { SearchContext } from '@/contexts/search-context';
import { UpdateFoodContext } from '@/contexts/food-update-context';
import { FaSpinner } from 'react-icons/fa';

export default function FoodListSheet({
	forceColumn = true,
	children
}: {
	forceColumn?: boolean;
	children?: React.ReactNode;
}) {
	const [foods, setFoods] = useState<GetFoodItem[]>([]);
	const [category, setCategory] = useState('');
	const foodContext = useContext(FoodSearchContext);
	const foodUpdateContext = useContext(UpdateFoodContext);

	const [isFetching, setIsFetching] = useState(true);

	const getFoods = async (term: string = '', cat: string = '', user = '') => {
		setIsFetching(true);
		const res = await getFoodItems(term, cat, user);

		if (res.success && res.data && res.data?.length > 0) {
			setFoods(res.data as GetFoodItem[]);
		}

		setIsFetching(false);
	};

	useEffect(() => {
		getFoods();
	}, []);

	const [search, setSearch] = useState('');
	const [debounced] = useDebounce(search, 1000);

	useEffect(() => {
		if (foodContext) {
			if (foodContext.searchType === 'input') {
				getFoods(debounced);
			}
		}
	}, [debounced]);

	useEffect(() => {
		getFoods('', category);
	}, [category]);

	useEffect(() => {
		scrollToTop();
	}, [foods]);

	const searchContext = useContext(SearchContext);

	useEffect(() => {
		if (searchContext && searchContext.searchType.name) {
			getFoods(searchContext.searchType.name);
		} else if (searchContext && searchContext.searchType.userId) {
			getFoods('', '', searchContext.searchType.userId);
		}
	}, [searchContext]);

	useEffect(() => {
		if (foodUpdateContext?.updated) {
			getFoods();
		}
	}, [foodUpdateContext]);

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
								onSelect={(value) => {
									setCategory(value);
								}}
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
									<div>There are currently no entered food items.</div>
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
					<SheetContent side='top'>
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
								showFilterIcon={true}
								iconsOnly={true}
								onSelect={(value) => {
									setCategory(value);
								}}
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
									<div>There are currently no entered food items.</div>
								)}
							</div>
						</ScrollArea>
					</SheetContent>
				</Sheet>
			</div>
		</>
	);
}

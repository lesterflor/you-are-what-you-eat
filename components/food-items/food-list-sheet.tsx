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
import { useContext, useEffect, useState } from 'react';
import { GetFoodItem } from '@/types';
import { getFoodItems } from '@/actions/food-actions';
import FoodItemCard from './food-item-card';
import { ScrollArea } from '../ui/scroll-area';
import { useDebounce } from 'use-debounce';
import InputWithButton from '../input-with-button';
import FoodItemCardSkeleton from '../skeletons/food-item-card-skeleton';
import FoodCategoryPicker from './food-categories';
import { FoodSearchContext } from '@/contexts/food-search-context';
import { cn } from '@/lib/utils';
import { SearchContext } from '@/contexts/search-context';

export default function FoodListSheet({
	forceColumn = true
}: {
	forceColumn?: boolean;
}) {
	const [foods, setFoods] = useState<GetFoodItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [category, setCategory] = useState('');
	const foodContext = useContext(FoodSearchContext);

	const getFoods = async (term: string = '', cat: string = '', user = '') => {
		setLoading(true);

		const res = await getFoodItems(term, cat, user);

		if (res.success && res.data && res.data?.length > 0) {
			setFoods(res.data as GetFoodItem[]);
		}

		setLoading(false);
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

	const searchContext = useContext(SearchContext);

	useEffect(() => {
		if (searchContext && searchContext.searchType.name) {
			getFoods(searchContext.searchType.name);
		} else if (searchContext && searchContext.searchType.userId) {
			getFoods('', '', searchContext.searchType.userId);
		}
	}, [searchContext]);

	return (
		<>
			<div className='portrait:hidden'>
				<Sheet>
					<SheetTrigger asChild>
						<Button>
							<Search className='w-4 h-4' /> Search Foods
						</Button>
					</SheetTrigger>
					<SheetContent side='right'>
						<SheetDescription></SheetDescription>
						<SheetTitle className='flex flex-col items-center gap-2 pb-4'>
							<InputWithButton
								className='w-[90%]'
								onChange={(val) => {
									setSearch(val);
								}}>
								<Search className='w-4 h-4 text-muted-foreground' />
							</InputWithButton>
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
								className={cn(
									'gap-4 pb-5 w-[97%]',
									forceColumn
										? 'flex flex-col'
										: 'grid grid-cols-2 lg:grid-cols-3'
								)}>
								{loading ? (
									Array.from({ length: 2 }).map((_v, indx) => (
										<FoodItemCardSkeleton key={indx} />
									))
								) : foods && foods.length > 0 ? (
									foods.map((item) => (
										<FoodItemCard
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
						<Button>
							<Search className='w-4 h-4' /> Search Foods
						</Button>
					</SheetTrigger>
					<SheetContent side='top'>
						<SheetDescription></SheetDescription>
						<SheetTitle className='flex flex-col items-center gap-2 pb-4'>
							<InputWithButton
								className='w-[90%]'
								onChange={(val) => {
									setSearch(val);
								}}>
								<Search className='w-4 h-4 text-muted-foreground' />
							</InputWithButton>
							<FoodCategoryPicker
								showFilterIcon={true}
								iconsOnly={true}
								onSelect={(value) => {
									setCategory(value);
								}}
								compactMode={true}
							/>
						</SheetTitle>
						<ScrollArea className='h-[70vh] w-full pr-3'>
							<div
								className={cn(
									'gap-4 pb-5 w-[100%]',
									forceColumn ? 'flex flex-col' : 'grid grid-cols-2'
								)}>
								{loading ? (
									Array.from({ length: 2 }).map((_v, indx) => (
										<FoodItemCardSkeleton key={indx} />
									))
								) : foods && foods.length > 0 ? (
									foods.map((item) => (
										<FoodItemCard
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

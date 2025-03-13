'use client';

import { Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { useEffect, useState } from 'react';
import { GetFoodItem } from '@/types';
import { getFoodItems } from '@/actions/food-actions';
import FoodItemCard from './food-item-card';
import { ScrollArea } from '../ui/scroll-area';
import { useDebounce } from 'use-debounce';
import InputWithButton from '../input-with-button';
import FoodItemCardSkeleton from '../skeletons/food-item-card-skeleton';

export default function FoodListSheet() {
	const [foods, setFoods] = useState<GetFoodItem[]>([]);
	const [loading, setLoading] = useState(false);

	const getFoods = async (term: string = '') => {
		setLoading(true);
		const res = await getFoodItems(term);

		if (res.success && res.data && res.data?.length > 0) {
			setFoods(res.data as GetFoodItem[]);
		}

		setTimeout(() => {
			setLoading(false);
		}, 2000);
	};

	useEffect(() => {
		getFoods();
	}, []);

	const [search, setSearch] = useState('');
	const [debounced] = useDebounce(search, 1000);

	useEffect(() => {
		getFoods(search);
	}, [debounced]);

	return (
		<>
			<div className='portrait:hidden'>
				<Sheet>
					<SheetTrigger asChild>
						<Button>
							<Search className='w-4 h-4' /> Browse
						</Button>
					</SheetTrigger>
					<SheetContent side='right'>
						<SheetTitle className='flex flex-row items-center gap-2 pb-4'>
							<InputWithButton
								className='w-[90%]'
								onChange={(val) => {
									setSearch(val);
								}}>
								<Search className='w-4 h-4 text-muted-foreground' />
							</InputWithButton>
						</SheetTitle>
						<ScrollArea className='h-full w-full pr-5'>
							<div className='flex flex-col gap-4 pb-5 w-[95%]'>
								{loading ? (
									Array.from({ length: 2 }).map((_v, indx) => (
										<FoodItemCardSkeleton key={indx} />
									))
								) : foods && foods.length > 0 ? (
									foods.map((item) => (
										<FoodItemCard
											item={item as GetFoodItem}
											key={item.id}
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
							<Search className='w-4 h-4' /> Browse
						</Button>
					</SheetTrigger>
					<SheetContent side='top'>
						<SheetTitle className='flex flex-row items-center gap-2 pb-4'>
							<InputWithButton
								className='w-[90%]'
								onChange={(val) => {
									setSearch(val);
								}}>
								<Search className='w-4 h-4 text-muted-foreground' />
							</InputWithButton>
						</SheetTitle>
						<ScrollArea className='h-[80vh] w-full pr-5'>
							<div className='flex flex-col gap-4 pb-5 w-[100%]'>
								{loading ? (
									Array.from({ length: 2 }).map((_v, indx) => (
										<FoodItemCardSkeleton key={indx} />
									))
								) : foods && foods.length > 0 ? (
									foods.map((item) => (
										<FoodItemCard
											item={item as GetFoodItem}
											key={item.id}
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

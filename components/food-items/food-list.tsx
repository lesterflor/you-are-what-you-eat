'use client';

import { useSession } from 'next-auth/react';
import AddFoodSheet from './add-food-sheet';
import InputWithButton from '../input-with-button';
import { Search } from 'lucide-react';
import FoodCategoryPicker from './food-categories';
import { ScrollArea } from '../ui/scroll-area';
import FoodItemCard from './food-item-card';
import { GetFoodItem } from '@/types';
import { useEffect, useRef, useState } from 'react';
import { getFoodItems } from '@/actions/food-actions';
import { useDebounce } from 'use-debounce';
import { FaSpinner } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
	inputSearch,
	selectFoodSearchData,
	selectFoodSearchStatus
} from '@/lib/features/food/foodSearchSlice';
import {
	selectFoodUpdateData,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';

export default function FoodList() {
	const dispatch = useAppDispatch();
	const foodSearchData = useAppSelector(selectFoodSearchData);
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);

	const foodUpdateData = useAppSelector(selectFoodUpdateData);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

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
		}
	}, [foodSearchStatus, foodSearchData]);

	const { data: session } = useSession();
	const [foods, setFoods] = useState<GetFoodItem[]>([]);

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
		<div className='flex flex-col gap-4'>
			<div className='text-2xl font-bold flex flex-row justify-between gap-4'>
				Food Database
				{session && <AddFoodSheet />}
			</div>
			<div className='text-2xl font-bold flex flex-row portrait:flex-col justify-between gap-4 portrait:gap-2'>
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
					onSelect={() => {}}
					compactMode={true}
				/>
			</div>
			<ScrollArea
				ref={scrollAreaRef}
				className='w-full h-[55] portrait:h-[50vh] pr-3'>
				<div className='flex flex-col gap-3 lg:grid lg:grid-cols-2'>
					{foods && foods.length > 0 ? (
						foods.map((item, indx) => (
							<FoodItemCard
								selfSearch={true}
								indx={indx}
								item={item as GetFoodItem}
								key={item.id}
							/>
						))
					) : (
						<div>There are currently no entered food items.</div>
					)}
				</div>
			</ScrollArea>
		</div>
	);
}

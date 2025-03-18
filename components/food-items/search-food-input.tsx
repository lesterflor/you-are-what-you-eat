'use client';

import { useRouter } from 'next/navigation';
import InputWithButton from '../input-with-button';
import { useContext, useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { Search } from 'lucide-react';
import { FoodSearchContext } from '@/contexts/food-search-context';

export default function SearchFoodInput() {
	const router = useRouter();
	const [search, setSearch] = useState('');

	const [debounced] = useDebounce(search, 1000);

	const foodContext = useContext(FoodSearchContext);

	useEffect(() => {
		if (foodContext && foodContext.searchType !== 'category') {
			router.push(`/foods?q=${search}`);
		} else {
			setSearch('');
		}
	}, [debounced, foodContext]);

	// useEffect(() => {
	// 	if (foodContext && foodContext.searchType === 'category') {
	// 		setSearch('');
	// 	}
	// }, [foodContext]);

	return (
		<div className='flex flex-row items-center flex-wrap gap-2'>
			<InputWithButton
				onChange={(val) => {
					setSearch(val);
				}}>
				<Search className='w-4 h-4 text-muted-foreground' />
			</InputWithButton>
		</div>
	);
}

'use client';

import {
	ISearchFoodContext,
	FoodSearchContext
} from '@/contexts/food-search-context';
import { useState } from 'react';

export default function FoodSearchProvider({
	children
}: {
	children: React.ReactNode;
}) {
	const [searchType, setSearchType] = useState<ISearchFoodContext>({
		searchType: null,
		updateSearchType: (update: ISearchFoodContext) => setSearchType(update)
	});

	return (
		<FoodSearchContext.Provider value={searchType}>
			{children}
		</FoodSearchContext.Provider>
	);
}

'use client';

import { ISearchContext, SearchContext } from '@/contexts/search-context';
import { useState } from 'react';

export default function SearchFoodProvider({
	children
}: {
	children: React.ReactNode;
}) {
	const [searchType, setSearchType] = useState<ISearchContext>({
		searchType: {},
		updateSearchType: (update: ISearchContext) => setSearchType(update)
	});

	return (
		<SearchContext.Provider value={searchType}>
			{children}
		</SearchContext.Provider>
	);
}

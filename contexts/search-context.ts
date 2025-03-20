'use client';

import { createContext } from 'react';

export type SearchContextType = { name?: string; userId?: string };

export interface ISearchContext {
	searchType: SearchContextType;
	updateSearchType?: (update: ISearchContext) => void;
}

export const SearchContext = createContext<ISearchContext | null>(null);

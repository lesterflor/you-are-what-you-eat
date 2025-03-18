'use client';

import { createContext } from 'react';

export type FoodContextSearchType = 'input' | 'category' | null;

export interface ISearchFoodContext {
	searchType: FoodContextSearchType;
	updateSearchType?: (update: ISearchFoodContext) => void;
}

export const FoodSearchContext = createContext<ISearchFoodContext | null>(null);

'use client';

import { createContext } from 'react';

export interface IUpdateGroceryListContext {
	updated: boolean;
	isUpdated?: (update: IUpdateGroceryListContext) => void;
}

export const UpdateGroceryListContext =
	createContext<IUpdateGroceryListContext | null>(null);

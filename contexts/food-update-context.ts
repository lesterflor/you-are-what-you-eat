'use client';

import { createContext } from 'react';

export interface IUpdateFoodContext {
	updated: boolean;
	isUpdated?: (data: IUpdateFoodContext) => void;
}

export const UpdateFoodContext = createContext<IUpdateFoodContext | null>(null);

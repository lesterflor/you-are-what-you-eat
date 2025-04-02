'use client';

import {
	IUpdateGroceryListContext,
	UpdateGroceryListContext
} from '@/contexts/update-grocery-list-context';
import { useState } from 'react';

export default function GroceryListUpdateContextProvider({
	children
}: {
	children: React.ReactNode;
}) {
	const [isUpdated, setIsUpdated] = useState<IUpdateGroceryListContext>({
		updated: false,
		isUpdated: (update: IUpdateGroceryListContext) => setIsUpdated(update)
	});

	return (
		<UpdateGroceryListContext.Provider value={isUpdated}>
			{children}
		</UpdateGroceryListContext.Provider>
	);
}

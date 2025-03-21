'use client';

import {
	IUpdateFoodContext,
	UpdateFoodContext
} from '@/contexts/food-update-context';
import { useState } from 'react';

export default function FoodUpdateProvider({
	children
}: {
	children: React.ReactNode;
}) {
	const [updated, setIsUpdated] = useState<IUpdateFoodContext>({
		updated: false,
		isUpdated: (data: IUpdateFoodContext) => setIsUpdated(data)
	});

	return (
		<UpdateFoodContext.Provider value={updated}>
			{children}
		</UpdateFoodContext.Provider>
	);
}

'use client';

import { cn } from '@/lib/utils';
import {
	Bean,
	Citrus,
	CookingPot,
	Ham,
	LeafyGreen,
	Nut,
	Wheat
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

export default function FoodCategoryIconMapper({
	type,
	small = false
}: {
	type: string;
	small?: boolean;
}) {
	const [icon, setIcon] = useState<React.ReactNode>();
	const iconSize = small ? 'w-4 h-4' : 'w-6 h-6';

	useEffect(() => {
		switch (type) {
			case 'veg':
				setIcon(<LeafyGreen className={cn(iconSize, '!text-green-800')} />);
				break;
			case 'meat':
				setIcon(<Ham className={cn(iconSize, '!text-amber-700')} />);
				break;
			case 'fruit':
				setIcon(<Citrus className={cn(iconSize, '!text-yellow-500')} />);
				break;
			case 'grain':
				setIcon(<Wheat className={cn(iconSize, '!text-yellow-300')} />);
				break;
			case 'legume':
				setIcon(<Bean className={cn(iconSize, '!text-amber-500')} />);
				break;
			case 'nutSeed':
				setIcon(<Nut className={cn(iconSize, '!text-amber-900')} />);
				break;
			case 'other':
				setIcon(<CookingPot className={cn(iconSize, '!text-slate-500')} />);
				break;
		}
	}, []);

	return <div>{icon}</div>;
}

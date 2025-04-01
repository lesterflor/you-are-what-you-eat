'use client';

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

export default function FoodCategoryIconMapper({ type }: { type: string }) {
	const [icon, setIcon] = useState<React.ReactNode>();

	useEffect(() => {
		switch (type) {
			case 'veg':
				setIcon(<LeafyGreen className='w-6 h-6 !text-green-800' />);
				break;
			case 'meat':
				setIcon(<Ham className='w-6 h-6 !text-amber-700' />);
				break;
			case 'fruit':
				setIcon(<Citrus className='w-6 h-6 !text-yellow-500' />);
				break;
			case 'grain':
				setIcon(<Wheat className='w-6 h-6 !text-yellow-300' />);
				break;
			case 'legume':
				setIcon(<Bean className='w-6 h-6 !text-amber-500' />);
				break;
			case 'nutSeed':
				setIcon(<Nut className='w-6 h-6 !text-amber-900' />);
				break;
			case 'other':
				setIcon(<CookingPot className='w-6 h-6 !text-slate-500' />);
				break;
		}
	}, []);

	return <div>{icon}</div>;
}

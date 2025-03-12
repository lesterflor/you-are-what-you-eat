'use client';

import {
	Bean,
	Citrus,
	Cookie,
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
				setIcon(<LeafyGreen className='w-6 h-6' />);
				break;
			case 'meat':
				setIcon(<Ham className='w-6 h-6' />);
				break;
			case 'fruit':
				setIcon(<Citrus className='w-6 h-6' />);
				break;
			case 'grain':
				setIcon(<Wheat className='w-6 h-6' />);
				break;
			case 'legume':
				setIcon(<Bean className='w-6 h-6' />);
				break;
			case 'nutSeed':
				setIcon(<Nut className='w-6 h-6' />);
				break;
			case 'other':
				setIcon(<Cookie className='w-6 h-6' />);
				break;
		}
	}, []);

	return <div>{icon}</div>;
}

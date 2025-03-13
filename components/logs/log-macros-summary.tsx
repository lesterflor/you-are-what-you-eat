'use client';

import { totalMacrosReducer } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';

export default function LogMacrosSummary({
	foodItems = []
}: {
	foodItems: GetFoodEntry[];
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [totalCarbs, setTotalCarbs] = useState(0);
	const [totalFat, setTotalFat] = useState(0);
	const [totalProtein, setTotalProtein] = useState(0);

	useEffect(() => {
		setTotalCals(totalMacrosReducer(foodItems).calories);
		setTotalCarbs(totalMacrosReducer(foodItems).carbs);
		setTotalFat(totalMacrosReducer(foodItems).fat);
		setTotalProtein(totalMacrosReducer(foodItems).protein);
	}, []);

	return (
		<div className='flex flex-row flex-wrap gap-2'>
			<Badge className='p-2 text-md'>Calories: {totalCals}</Badge>
			<Badge className='p-2 text-md'>Protein: {totalProtein}</Badge>
			<Badge className='p-2 text-md'>Carbs: {totalCarbs}</Badge>
			<Badge className='p-2 text-md'>Fat: {totalFat}</Badge>
		</div>
	);
}

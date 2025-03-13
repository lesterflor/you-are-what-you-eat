'use client';

import { totalMacrosReducer } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { useContext, useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { createDailyLog } from '@/actions/log-actions';
import { LogUpdateContext } from '@/contexts/log-context';

export default function LogMacrosSummary({
	children,
	compactMode = false
}: {
	children?: React.ReactNode;
	compactMode?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [totalCarbs, setTotalCarbs] = useState(0);
	const [totalFat, setTotalFat] = useState(0);
	const [totalProtein, setTotalProtein] = useState(0);

	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		getLog();
	}, []);

	const getLog = async () => {
		const res = await createDailyLog();

		if (res?.success && res.data && res.data.foodItems.length > 0) {
			const { foodItems } = res.data;
			const items = foodItems as GetFoodEntry[];
			setTotalCals(totalMacrosReducer(items).calories);
			setTotalCarbs(totalMacrosReducer(items).carbs);
			setTotalFat(totalMacrosReducer(items).fat);
			setTotalProtein(totalMacrosReducer(items).protein);
		}
	};

	useEffect(() => {
		if (logContext?.updated) {
			getLog();
		}
	}, [logContext]);

	return (
		<>
			{compactMode ? (
				<div className='flex flex-col gap-1'>
					<div className='text-xs'>{children}</div>
					<div className='flex flex-row flex-wrap gap-2'>
						<Badge className='p-1 text-xs'>Cals: {totalCals}</Badge>
						<Badge className='p-1 text-xs'>Prot: {totalProtein}g</Badge>
						<Badge className='p-1 text-xs'>Carb: {totalCarbs}g</Badge>
						<Badge className='p-1 text-xs'>Fat: {totalFat}g</Badge>
					</div>
				</div>
			) : (
				<div className='flex flex-row flex-wrap gap-2'>
					<Badge className='p-2 text-md'>Calories: {totalCals}</Badge>
					<Badge className='p-2 text-md'>Protein: {totalProtein} g</Badge>
					<Badge className='p-2 text-md'>Carbs: {totalCarbs} g</Badge>
					<Badge className='p-2 text-md'>Fat: {totalFat} g</Badge>
				</div>
			)}
		</>
	);
}

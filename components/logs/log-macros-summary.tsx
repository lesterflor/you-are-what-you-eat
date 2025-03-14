'use client';

import { formatUnit, totalMacrosReducer } from '@/lib/utils';
import { GetFoodEntry, GetLog } from '@/types';
import { useContext, useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { createDailyLog } from '@/actions/log-actions';
import { LogUpdateContext } from '@/contexts/log-context';

export default function LogMacrosSummary({
	log,
	children,
	compactMode = false,
	getTodayMode = true
}: {
	log?: GetLog;
	children?: React.ReactNode;
	compactMode?: boolean;
	getTodayMode?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [totalCarbs, setTotalCarbs] = useState(0);
	const [totalFat, setTotalFat] = useState(0);
	const [totalProtein, setTotalProtein] = useState(0);

	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		if (getTodayMode) {
			getLog();
		} else if (!getTodayMode && log) {
			setTotalCals(totalMacrosReducer(log.foodItems).calories);
			setTotalCarbs(totalMacrosReducer(log.foodItems).carbs);
			setTotalFat(totalMacrosReducer(log.foodItems).fat);
			setTotalProtein(totalMacrosReducer(log.foodItems).protein);
		}
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
		if (logContext?.updated && getTodayMode) {
			getLog();
		}
	}, [logContext]);

	return (
		<>
			{compactMode ? (
				<div className='flex flex-col gap-1'>
					<div className='text-xs'>{children}</div>
					<div className='flex flex-row flex-wrap gap-2'>
						<Badge className='p-1 text-xs'>Cals: {formatUnit(totalCals)}</Badge>
						<Badge className='p-1 text-xs'>
							Prot: {formatUnit(totalProtein)}g
						</Badge>
						<Badge className='p-1 text-xs'>
							Carb: {formatUnit(totalCarbs)}g
						</Badge>
						<Badge className='p-1 text-xs'>Fat: {formatUnit(totalFat)}g</Badge>
					</div>
				</div>
			) : (
				<div className='flex flex-row flex-wrap gap-2'>
					<Badge className='p-2 text-md'>
						Calories: {formatUnit(totalCals)}
					</Badge>
					<Badge className='p-2 text-md'>
						Protein: {formatUnit(totalProtein)} g
					</Badge>
					<Badge className='p-2 text-md'>
						Carbs: {formatUnit(totalCarbs)} g
					</Badge>
					<Badge className='p-2 text-md'>Fat: {formatUnit(totalFat)} g</Badge>
				</div>
			)}
		</>
	);
}

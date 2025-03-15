'use client';

import {
	formatUnit,
	getMacroPercOfCals,
	totalMacrosReducer
} from '@/lib/utils';
import { GetFoodEntry, GetLog } from '@/types';
import { useContext, useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { createDailyLog } from '@/actions/log-actions';
import { LogUpdateContext } from '@/contexts/log-context';
import LogMacrosSkeleton from '../skeletons/log-macros-skeleton';

export default function LogMacrosSummary({
	log,
	children,
	compactMode = false,
	getTodayMode = true,
	detailedMode = false,
	useSkeleton = false
}: {
	log?: GetLog;
	children?: React.ReactNode;
	compactMode?: boolean;
	getTodayMode?: boolean;
	detailedMode?: boolean;
	useSkeleton?: boolean;
}) {
	const [totalCals, setTotalCals] = useState(0);
	const [totalCarbs, setTotalCarbs] = useState(0);
	const [totalFat, setTotalFat] = useState(0);
	const [totalProtein, setTotalProtein] = useState(0);
	const [isFetching, setIsFetching] = useState(false);

	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		if (getTodayMode) {
			getLog();
		} else if (!getTodayMode && log) {
			setIsFetching(false);
			setTotalCals(totalMacrosReducer(log.foodItems).calories);
			setTotalCarbs(totalMacrosReducer(log.foodItems).carbs);
			setTotalFat(totalMacrosReducer(log.foodItems).fat);
			setTotalProtein(totalMacrosReducer(log.foodItems).protein);
		}
	}, []);

	const getLog = async () => {
		setIsFetching(true);
		const res = await createDailyLog();

		if (res?.success && res.data && res.data.foodItems.length > 0) {
			const { foodItems } = res.data;
			const items = foodItems as GetFoodEntry[];
			setTotalCals(totalMacrosReducer(items).calories);
			setTotalCarbs(totalMacrosReducer(items).carbs);
			setTotalFat(totalMacrosReducer(items).fat);
			setTotalProtein(totalMacrosReducer(items).protein);
		}
		setIsFetching(false);
	};

	useEffect(() => {
		if (logContext?.updated && getTodayMode) {
			getLog();
		}
	}, [logContext]);

	return (
		<>
			{compactMode ? (
				isFetching && useSkeleton ? (
					<LogMacrosSkeleton detailedMode={detailedMode} />
				) : (
					<div className='flex flex-col gap-1'>
						<div className='text-xs'>{children}</div>
						<div className='flex flex-row flex-wrap gap-2'>
							<Badge className='p-1 text-xs'>
								Cals: {formatUnit(totalCals)}
							</Badge>
							<Badge className='p-1 text-xs'>
								Prot: {formatUnit(totalProtein)}g
							</Badge>
							<Badge className='p-1 text-xs'>
								Carb: {formatUnit(totalCarbs)}g
							</Badge>
							<Badge className='p-1 text-xs'>
								Fat: {formatUnit(totalFat)}g
							</Badge>
						</div>

						{detailedMode && (
							<div className='grid grid-cols-2 gap-2 text-xs'>
								<br />
								<div className='col-span-2 border-b-2 font-semibold text-lg'>
									Calories breakdown
								</div>
								<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Prot:</span>{' '}
									{formatUnit(totalProtein * 4)}
									<span className='text-muted-foreground'>
										{getMacroPercOfCals(totalProtein, totalCals, 'protein')}
									</span>
								</div>
								<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Carb:</span>{' '}
									{formatUnit(totalCarbs * 4)}
									<span className='text-muted-foreground'>
										{getMacroPercOfCals(totalCarbs, totalCals, 'carb')}
									</span>
								</div>
								<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Fat:</span>{' '}
									{formatUnit(totalFat * 4)}
									<span className='text-muted-foreground'>
										{getMacroPercOfCals(totalFat, totalCals, 'fat')}
									</span>
								</div>
							</div>
						)}
					</div>
				)
			) : isFetching && useSkeleton ? (
				<LogMacrosSkeleton detailedMode={detailedMode} />
			) : (
				<div className='flex flex-col gap-4'>
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

					{detailedMode && (
						<div className='grid grid-cols-2 gap-2 text-xs'>
							<br />
							<div className='col-span-2 border-b-2 font-semibold text-lg'>
								Calories breakdown
							</div>
							<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>Protein:</span>{' '}
								{formatUnit(totalProtein * 4)}
								<span className='text-muted-foreground'>
									{getMacroPercOfCals(totalProtein, totalCals, 'protein')}
								</span>
							</div>
							<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>Carbohydrates:</span>{' '}
								{formatUnit(totalCarbs * 4)}
								<span className='text-muted-foreground'>
									{getMacroPercOfCals(totalCarbs, totalCals, 'carb')}
								</span>
							</div>
							<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>Fat:</span>{' '}
								{formatUnit(totalFat * 4)}
								<span className='text-muted-foreground'>
									{getMacroPercOfCals(totalFat, totalCals, 'fat')}
								</span>
							</div>
						</div>
					)}
				</div>
			)}
		</>
	);
}

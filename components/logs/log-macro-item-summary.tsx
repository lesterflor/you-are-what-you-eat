'use client';

import { createDailyLog } from '@/actions/log-actions';
import { formatUnit } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { useCallback, useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export default function LogMacroItemSummary({
	macro
}: {
	macro: 'protein' | 'carbs' | 'fat';
}) {
	const [foodEntries, setFoodEntries] = useState<GetFoodEntry[]>([]);
	const [isFetching, setIsFetching] = useState(false);

	const fetchMacros = useCallback(async () => {
		setIsFetching(true);
		const res = await createDailyLog();

		if (res?.success && res.data) {
			let sortedFoodList;

			switch (macro) {
				case 'carbs':
					sortedFoodList = [...res.data.foodItems].sort(
						(a, b) => b.carbGrams - a.carbGrams
					);
					break;
				case 'protein':
					sortedFoodList = [...res.data.foodItems].sort(
						(a, b) => b.proteinGrams - a.proteinGrams
					);
					break;
				case 'fat':
					sortedFoodList = [...res.data.foodItems].sort(
						(a, b) => b.fatGrams - a.fatGrams
					);
					break;
			}

			setFoodEntries(sortedFoodList as GetFoodEntry[]);
		}

		setIsFetching(false);
	}, [macro]);

	useEffect(() => {
		fetchMacros();
	}, []);

	return (
		<>
			{isFetching ? (
				<FaSpinner className='w-8 h-8 animate-spin opacity-10' />
			) : (
				<ScrollArea className='w-full pt-4'>
					<div className='flex flex-col gap-2 max-h-[10rem]'>
						{foodEntries.length > 0 &&
							foodEntries.map((item) => {
								let macroField;
								switch (macro) {
									case 'protein':
										macroField = item.proteinGrams;
										break;
									case 'carbs':
										macroField = item.carbGrams;
										break;
									case 'fat':
										macroField = item.fatGrams;
										break;
								}

								return (
									<Card
										key={item.id}
										className='p-0 w-full'>
										<CardContent className='flex flex-row items-center gap-2 justify-between w-full p-1.5'>
											<div className='font-normal leading-tight text-muted-foreground'>
												{item.name}
											</div>
											<div className='whitespace-nowrap'>{`${formatUnit(
												macroField
											)} g`}</div>
										</CardContent>
									</Card>
								);
							})}
					</div>
				</ScrollArea>
			)}
		</>
	);
}

'use client';

import { createDailyLog } from '@/actions/log-actions';
import { formatUnit } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { ImSpinner2 } from 'react-icons/im';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export default function LogMacroItemSummary({
	macro
}: {
	macro: 'protein' | 'carbs' | 'fat' | 'calories';
}) {
	const [foodEntries, setFoodEntries] = useState<GetFoodEntry[]>([]);
	const [isFetching, setIsFetching] = useTransition();

	const fetchMacros = useCallback(() => {
		setIsFetching(async () => {
			const res = await createDailyLog();

			if (res?.success && res.data) {
				let sortedFoodList;

				switch (macro) {
					case 'calories':
						sortedFoodList = [...res.data.foodItems].sort(
							(a, b) => b.calories * b.numServings - a.calories * a.numServings
						);
						break;
					case 'carbs':
						sortedFoodList = [...res.data.foodItems].sort(
							(a, b) =>
								b.carbGrams * b.numServings - a.carbGrams * a.numServings
						);
						break;
					case 'protein':
						sortedFoodList = [...res.data.foodItems].sort(
							(a, b) =>
								b.proteinGrams * b.numServings - a.proteinGrams * a.numServings
						);
						break;
					case 'fat':
						sortedFoodList = [...res.data.foodItems].sort(
							(a, b) => b.fatGrams * b.numServings - a.fatGrams * a.numServings
						);
						break;
				}

				setIsFetching(() => {
					setFoodEntries(sortedFoodList as GetFoodEntry[]);
				});
			}
		});
	}, [macro]);

	useEffect(() => {
		fetchMacros();
	}, []);

	return (
		<>
			{isFetching ? (
				<ImSpinner2 className='w-8 h-8 animate-spin opacity-10' />
			) : (
				<div className='flex flex-col gap-2 pt-4 w-full'>
					{foodEntries.length > 0 && (
						<div className='flex flex-row gap-1'>
							<BiSolidFoodMenu className='w-4 h-4' />
							<div>{`${foodEntries.length} ${
								foodEntries.length === 1 ? 'item' : 'items'
							}`}</div>
						</div>
					)}
					<ScrollArea className='w-full'>
						<div className='flex flex-col gap-2 max-h-[17rem]'>
							{foodEntries.length > 0 &&
								foodEntries.map((item) => {
									let macroField;
									const {
										proteinGrams,
										carbGrams,
										fatGrams,
										numServings,
										id,
										eatenAt,
										name,
										calories
									} = item;

									switch (macro) {
										case 'protein':
											macroField = proteinGrams * numServings;
											break;
										case 'carbs':
											macroField = carbGrams * numServings;
											break;
										case 'fat':
											macroField = fatGrams * numServings;
											break;
										default:
											macroField = calories * numServings;
											break;
									}

									return (
										<Card
											key={`${id}-${eatenAt.getTime()}`}
											className='p-0 w-full bg-green-950'>
											<CardContent className='flex flex-row items-center gap-2 justify-between w-full p-1.5'>
												<div className='font-normal leading-tight text-muted-foreground capitalize'>
													{name}
												</div>
												<div className='whitespace-nowrap'>{`${formatUnit(
													macroField
												)}`}</div>
											</CardContent>
										</Card>
									);
								})}
						</div>
					</ScrollArea>
				</div>
			)}
		</>
	);
}

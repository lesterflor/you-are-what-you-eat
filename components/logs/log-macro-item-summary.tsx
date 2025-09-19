'use client';

import { getCurrentLogQueryOptions } from '@/lib/queries/logQueries';
import { formatUnit } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { BiSolidFoodMenu } from 'react-icons/bi';
import { Card, CardContent } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';

export default function LogMacroItemSummary({
	macro
}: {
	macro: 'protein' | 'carbs' | 'fat' | 'calories';
}) {
	const { data } = useQuery(getCurrentLogQueryOptions());

	let sortedFoodList = [] as GetFoodEntry[];

	switch (macro) {
		case 'calories':
			sortedFoodList = data
				? [...data.foodItems].sort(
						(a, b) => b.calories * b.numServings - a.calories * a.numServings
				  )
				: [];
			break;
		case 'carbs':
			sortedFoodList = data
				? [...data.foodItems].sort(
						(a, b) => b.carbGrams * b.numServings - a.carbGrams * a.numServings
				  )
				: [];
			break;
		case 'protein':
			sortedFoodList = data
				? [...data.foodItems].sort(
						(a, b) =>
							b.proteinGrams * b.numServings - a.proteinGrams * a.numServings
				  )
				: [];
			break;
		case 'fat':
			sortedFoodList = data
				? [...data.foodItems].sort(
						(a, b) => b.fatGrams * b.numServings - a.fatGrams * a.numServings
				  )
				: [];
			break;
	}

	const foodEntries: GetFoodEntry[] = sortedFoodList;

	return (
		<>
			{foodEntries && foodEntries.length > 0 && (
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
						<div className='flex flex-col gap-2 max-h-[15rem]'>
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

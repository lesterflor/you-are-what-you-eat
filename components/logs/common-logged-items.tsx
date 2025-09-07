'use client';

import { getCommonItemsInLog } from '@/actions/log-actions';
import { cn, formatUnit } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { format } from 'date-fns';
import { memo, useEffect, useState } from 'react';
import FoodCategoryIconMapper from '../food-items/food-category-icon-mapper';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

const CommonLoggedItems = memo(function CommonLoggedItems() {
	const [categories, setCategories] = useState<{
		fruit: number;
		grain: number;
		legume: number;
		meat: number;
		nutSeed: number;
		other: number;
		veg: number;
		total: number;
	}>();

	const [firstDate, setFirstDate] = useState<Date>();

	const fetchLogs = async () => {
		const res = await getCommonItemsInLog();

		if (res.success && res.data && res.data.length > 0) {
			const result = Object.groupBy(
				res.data,
				({ category }: GetFoodEntry) => category
			);

			const { fruit, grain, legume, meat, nutSeed, other, veg } = result;

			const t = Object.values(result).reduce(
				(acc, curr) => acc + (curr?.length || 0),
				0
			);

			if (res.firstLog) {
				setFirstDate(res.firstLog.createdAt);
			}

			setCategories({
				fruit: fruit?.length || 0,
				grain: grain?.length || 0,
				legume: legume?.length || 0,
				meat: meat?.length || 0,
				nutSeed: nutSeed?.length || 0,
				other: other?.length || 0,
				veg: veg?.length || 0,
				total: t
			});
		}
	};

	useEffect(() => {
		fetchLogs();
	}, []);

	return (
		<>
			{categories && (
				<ScrollArea className='w-full'>
					{categories && (
						<div
							className={cn(
								'transition-opacity fade-in animate-in duration-1000 flex flex-col gap-2 py-4 items-center justify-center w-full'
							)}>
							<div className='flex flex-row gap-2 items-center flex-wrap w-[96%] rounded-md border-2 p-4 justify-center'>
								<div className='text-sm leading-tight px-4 pb-4 text-center text-muted-foreground'>
									{firstDate ? `Since ${format(firstDate, 'PPP')}` : 'To date'},
									your diet consists of the following categories:
								</div>
								<Badge
									variant={'outline'}
									className='bg-yellow-700 text-background py-2 gap-1 px-1 font-normal'>
									<FoodCategoryIconMapper
										type='fruit'
										small={true}
									/>
									Fruit{' '}
									{formatUnit((categories.fruit / categories.total) * 100)}%
								</Badge>

								<Badge
									variant={'outline'}
									className='bg-amber-700 text-background py-2 gap-1 px-1 font-normal'>
									<FoodCategoryIconMapper
										type='legume'
										small={true}
									/>
									Legume{' '}
									{formatUnit((categories.legume / categories.total) * 100)}%
								</Badge>
								<Badge
									variant={'outline'}
									className='bg-amber-900 text-muted-foreground py-2 gap-1 px-1 font-normal'>
									<FoodCategoryIconMapper
										type='meat'
										small={true}
									/>
									Meat {formatUnit((categories.meat / categories.total) * 100)}%
								</Badge>
								<Badge
									variant={'outline'}
									className='bg-yellow-500 text-background py-2 gap-1 px-1 font-normal'>
									<FoodCategoryIconMapper
										type='grain'
										small={true}
									/>
									Grain{' '}
									{formatUnit((categories.grain / categories.total) * 100)}%
								</Badge>
								<Badge
									variant={'outline'}
									className='bg-amber-950 text-muted-foreground py-2 gap-1 px-1 font-normal'>
									<FoodCategoryIconMapper
										type='nutSeed'
										small={true}
									/>
									Nuts{' '}
									{formatUnit((categories.nutSeed / categories.total) * 100)}%
								</Badge>
								<Badge
									variant={'outline'}
									className='bg-slate-700 text-muted-foreground py-2 gap-1 px-1 font-normal'>
									<FoodCategoryIconMapper
										type='other'
										small={true}
									/>
									Other{' '}
									{formatUnit((categories.other / categories.total) * 100)}%
								</Badge>
								<Badge
									variant={'outline'}
									className='bg-green-950 text-muted-foreground py-2 gap-1 px-1 font-normal'>
									<FoodCategoryIconMapper
										type='veg'
										small={true}
									/>
									Vegetables{' '}
									{formatUnit((categories.veg / categories.total) * 100)}%
								</Badge>
							</div>
						</div>
					)}
				</ScrollArea>
			)}
		</>
	);
});

export default CommonLoggedItems;

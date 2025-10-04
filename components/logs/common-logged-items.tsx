'use client';

import { getCommonItemsQueryOptions } from '@/lib/queries/logQueries';
import { cn, formatUnit } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { memo } from 'react';
import FoodCategoryIconMapper from '../food-items/food-category-icon-mapper';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

const CommonLoggedItems = memo(function CommonLoggedItems() {
	const { data } = useQuery(getCommonItemsQueryOptions());

	if (!data) {
		return null;
	}

	const { firstDate, categories } = data;
	const { fruit, grain, legume, meat, nutSeed, other, veg, total } = categories;

	return (
		<>
			{categories && (
				<ScrollArea className='w-full'>
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
								Fruit {formatUnit((fruit / total) * 100)}%
							</Badge>

							<Badge
								variant={'outline'}
								className='bg-amber-700 text-background py-2 gap-1 px-1 font-normal'>
								<FoodCategoryIconMapper
									type='legume'
									small={true}
								/>
								Legume {formatUnit((legume / total) * 100)}%
							</Badge>
							<Badge
								variant={'outline'}
								className='bg-amber-900 text-white dark:text-muted-foreground py-2 gap-1 px-1 font-normal'>
								<FoodCategoryIconMapper
									type='meat'
									small={true}
								/>
								Meat {formatUnit((meat / total) * 100)}%
							</Badge>
							<Badge
								variant={'outline'}
								className='bg-yellow-500 text-background py-2 gap-1 px-1 font-normal'>
								<FoodCategoryIconMapper
									type='grain'
									small={true}
								/>
								Grain {formatUnit((grain / total) * 100)}%
							</Badge>
							<Badge
								variant={'outline'}
								className='bg-amber-950 text-white dark:text-muted-foreground py-2 gap-1 px-1 font-normal'>
								<FoodCategoryIconMapper
									type='nutSeed'
									small={true}
								/>
								Nuts {formatUnit((nutSeed / total) * 100)}%
							</Badge>
							<Badge
								variant={'outline'}
								className='bg-slate-700 text-white dark:text-muted-foreground py-2 gap-1 px-1 font-normal'>
								<FoodCategoryIconMapper
									type='other'
									small={true}
								/>
								Other {formatUnit((other / total) * 100)}%
							</Badge>
							<Badge
								variant={'outline'}
								className='bg-green-950 text-white dark:text-muted-foreground py-2 gap-1 px-1 font-normal'>
								<FoodCategoryIconMapper
									type='veg'
									small={true}
								/>
								Vegetables {formatUnit((veg / total) * 100)}%
							</Badge>
						</div>
					</div>
				</ScrollArea>
			)}
		</>
	);
});

export default CommonLoggedItems;

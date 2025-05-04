'use client';

import { getCommonItemsInLog } from '@/actions/log-actions';
import { cn, formatUnit } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';

export default function CommonLoggedItems() {
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

	const fetchLogs = async () => {
		const res = await getCommonItemsInLog();

		if (res.success && res.data) {
			const result = Object.groupBy(
				res.data,
				({ category }: GetFoodEntry) => category
			);

			const { fruit, grain, legume, meat, nutSeed, other, veg } = result;

			const t = Object.values(result).reduce(
				(acc, curr) => acc + (curr?.length || 0),
				0
			);

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
			<ScrollArea className='w-full'>
				{categories && (
					<div
						className={cn(
							'transition-opacity fade-in animate-in duration-1000 flex flex-col gap-2 pt-4 items-center justify-center w-full'
						)}>
						<div className='text-sm leading-tight'>
							To date, your diet consists of the following categories
						</div>
						<div className='flex flex-row gap-2 items-center flex-wrap max-h-[25vh] w-[96%] text-sm rounded-md border-2 p-4'>
							<Badge>
								Fruit {formatUnit((categories.fruit / categories.total) * 100)}%
							</Badge>
							<Badge>
								Grain {formatUnit((categories.grain / categories.total) * 100)}%
							</Badge>
							<Badge>
								Legume{' '}
								{formatUnit((categories.legume / categories.total) * 100)}%
							</Badge>
							<Badge>
								Meat {formatUnit((categories.meat / categories.total) * 100)}%
							</Badge>
							<Badge>
								Nuts {formatUnit((categories.nutSeed / categories.total) * 100)}
								%
							</Badge>
							<Badge>
								Other {formatUnit((categories.other / categories.total) * 100)}%
							</Badge>
							<Badge>
								Vegetables{' '}
								{formatUnit((categories.veg / categories.total) * 100)}%
							</Badge>
						</div>
					</div>
				)}
			</ScrollArea>
		</>
	);
}

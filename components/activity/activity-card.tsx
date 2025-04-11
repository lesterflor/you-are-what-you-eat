'use client';

import { GetActivityItem } from '@/types';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const formatItemType = (type: string) => {
	let lbl = '';
	let css = '';

	switch (type) {
		case 'logFood':
			lbl = 'Log Update';
			css = 'text-amber-300';
			break;
		case 'noteData':
			lbl = 'Notes';
			css = 'text-slate-600';
			break;
		case 'foodSearch':
			lbl = 'Search';
			css = 'text-amber-600';
			break;
		case 'groceryData':
			lbl = 'Groceries';
			css = 'text-green-600';
			break;
		case 'foodData':
			lbl = 'Food';
			css = 'text-amber-100';
			break;
	}

	return { label: lbl, css };
};

export default function ActivityCard({ item }: { item: GetActivityItem }) {
	return (
		<div className='rounded-md border-2 p-2 text-xs'>
			<div className='flex flex-row items-center justify-between pb-2'>
				<div className='capitalize flex flex-row items-center gap-1'>
					<Info className={cn('w-4 h-4', formatItemType(item.type).css)} />
					<span
						className={cn(
							'text-foreground font-semibold',
							formatItemType(item.type).css
						)}>
						{formatItemType(item.type).label}
					</span>
				</div>
				<Badge
					variant='secondary'
					className='font-normal whitespace-nowrap'>
					{format(item.createdAt, 'h:mm:ss a')}
				</Badge>
			</div>

			<div className='whitespace-pre-line text-muted-foreground'>
				{item.data}
			</div>
		</div>
	);
}

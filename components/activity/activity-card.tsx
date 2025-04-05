'use client';

import { GetActivityItem } from '@/types';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';

const formatItemType = (type: string) => {
	let lbl = '';

	switch (type) {
		case 'logFood':
			lbl = 'Log Update';
			break;
		case 'noteData':
			lbl = 'Notes';
			break;
		case 'foodSearch':
			lbl = 'Search';
			break;
		case 'groceryData':
			lbl = 'Groceries';
			break;
	}

	return lbl;
};

export default function ActivityCard({ item }: { item: GetActivityItem }) {
	return (
		<div className='rounded-md border-2 p-2 text-xs'>
			<div className='flex flex-row items-center justify-between pb-2'>
				<div className='capitalize'>
					<span className='text-foreground font-semibold'>
						{formatItemType(item.type)}
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

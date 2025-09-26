'use client';

import { getFoodQueryOptions } from '@/lib/queries/foodQueries';
import { getNewItemCount } from '@/lib/utils';
import { GetFoodItem } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { Asterisk } from 'lucide-react';
import { useMemo } from 'react';
import { Button } from '../ui/button';

export default function NewItemsBadge({
	onBadgeClick
}: {
	onBadgeClick?: () => void;
}) {
	const { data = [] } = useQuery(getFoodQueryOptions());

	const itemCount = useMemo(
		() => getNewItemCount(data as GetFoodItem[]),
		[data]
	);

	if (itemCount === 0) {
		return null;
	}

	return (
		<Button
			onClick={() => onBadgeClick?.()}
			variant='secondary'
			size={'sm'}
			className='!gap-0 !px-1.5 bg-emerald-900 transition-opacity fade-in animate-in duration-1000'>
			<Asterisk className='text-green-500 animate-pulse !w-6 !h-6' />
			<span className='text-xs'>
				{itemCount === 1 ? '1 new item' : `${itemCount} new items`}
			</span>
		</Button>
	);
}

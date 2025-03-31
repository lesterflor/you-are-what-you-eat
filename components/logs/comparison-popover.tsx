'use client';

import { LogComparisonType } from '@/types';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatUnit } from '@/lib/utils';

export default function ComparisonPopover({
	data,
	field
}: {
	data: LogComparisonType;
	field: 'calories' | 'protein' | 'carbs' | 'fat';
}) {
	if (!data) {
		return null;
	}

	const fieldData = data[field];

	return (
		<Popover>
			<PopoverTrigger>
				<div>
					{fieldData.belowYesterday ? (
						<ArrowDown className='w-3 h-3 text-green-100' />
					) : (
						<ArrowUp className='w-3 h-3 text-red-600' />
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-1 items-center text-xs w-32 py-2 pr-4 pl-2'>
				<div className='capitalize'>{field}</div>
				<div className='flex flex-row justify-between w-full'>
					<div className='text-muted-foreground'>Yesterday</div>
					<div>{formatUnit(fieldData.yesterday)}</div>
				</div>
				<div className='flex flex-row justify-between w-full'>
					<div className='text-muted-foreground'>Today</div>
					<div>{formatUnit(fieldData.today)}</div>
				</div>
				<div className='flex flex-row justify-between w-full relative pr-1'>
					<div className='text-muted-foreground'>
						{fieldData.belowYesterday ? 'Consumed Less' : 'Consumed More'}
					</div>
					<div className='flex flex-row gap-0 items-end justify-end'>
						<div className='font-semibold'>
							{Math.abs(formatUnit(fieldData.yesterday - fieldData.today))}
						</div>
						<div className='absolute -right-4'>
							{fieldData.belowYesterday ? (
								<ArrowDown className='w-4 h-4 text-green-600 animate-bounce' />
							) : (
								<ArrowUp className='w-4 h-4 text-red-600 animate-bounce' />
							)}
						</div>
					</div>
				</div>
			</PopoverContent>
		</Popover>
	);
}

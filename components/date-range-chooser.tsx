'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { DateRange } from 'react-day-picker';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export default function DateRangeChooser({
	onSelect
}: {
	onSelect: (range: DateRange | undefined) => void;
}) {
	const [datePickerOpen, setDatePickerOpen] = useState(false);
	const [date, setDate] = useState<DateRange | undefined>();

	useEffect(() => {
		if (date?.from && date?.to) {
			setDatePickerOpen(false);
			onSelect(date);
		} else if (date === undefined) {
			setDatePickerOpen(false);
			onSelect(undefined);
		}
		console.log(date);
	}, [date]);

	return (
		<Popover
			open={datePickerOpen}
			onOpenChange={setDatePickerOpen}>
			<PopoverTrigger asChild>
				<div className='flex flex-col items-center gap-1'>
					<Button
						variant={'secondary'}
						id='date'
						className={cn(
							'justify-start text-left font-normal',
							!date && 'text-muted-foreground'
						)}>
						<CalendarIcon />
						{date?.from ? (
							date.to ? (
								<>
									{format(date.from, 'LLL dd, y')} -{' '}
									{format(date.to, 'LLL dd, y')}
								</>
							) : (
								format(date.from, 'LLL dd, y')
							)
						) : (
							<span>Select a date range</span>
						)}
					</Button>
				</div>
			</PopoverTrigger>
			<PopoverContent
				className='w-auto p-0'
				align='start'>
				<Calendar
					hideHead={true}
					classNames={{
						day: 'w-7 h-7 text-xs rounded-sm',
						row: 'flex w-full mt-1'
					}}
					initialFocus
					mode='range'
					defaultMonth={date?.from}
					selected={date}
					onSelect={setDate}
					numberOfMonths={2}
				/>
			</PopoverContent>
		</Popover>
	);
}

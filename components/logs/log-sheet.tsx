'use client';

import { GetLog } from '@/types';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import FoodLogList from './log-list';
import { formatDateTime } from '@/lib/utils';
import { CalendarSearch } from 'lucide-react';

export default function LogSheet({ log }: { log: GetLog }) {
	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>View today&apos;s log</Button>
			</SheetTrigger>
			<SheetContent side='left'>
				<SheetTitle className='text-md flex flex-row items-center justify-center gap-2 pb-2'>
					<CalendarSearch className='w-4 h-4' />
					{formatDateTime(log.createdAt).dateOnly}
				</SheetTitle>

				<FoodLogList log={log} />
			</SheetContent>
		</Sheet>
	);
}

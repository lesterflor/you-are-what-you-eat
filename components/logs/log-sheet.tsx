'use client';

import { GetLog } from '@/types';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import { Button } from '../ui/button';
import FoodLogList from './log-list';
import { cn, getToday } from '@/lib/utils';
import { CalendarSearch, FileClock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

export default function LogSheet({
	log,
	onOpen
}: {
	log: GetLog;
	onOpen?: () => void;
}) {
	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		if (isOpen) {
			onOpen?.();
		}
	}, [isOpen]);

	if (!log) {
		return null;
	}
	return (
		<Sheet
			open={isOpen}
			onOpenChange={setIsOpen}>
			<SheetTrigger
				asChild
				className={cn(pathname === '/' && 'hidden')}>
				<Button>
					<FileClock className='w-4 h-4' /> Today&apos;s log
				</Button>
			</SheetTrigger>
			<SheetContent
				side='left'
				className='portrait:min-w-[85vw] max-w-[100vw] portrait:w-[100vw]'>
				<SheetDescription></SheetDescription>
				<SheetTitle className='text-md flex flex-row items-center justify-start gap-2 pb-2'>
					<CalendarSearch className='w-4 h-4' />
					{format(getToday().current, 'PP hh:mm a')}
				</SheetTitle>

				<FoodLogList
					iconPosition='top'
					className='portrait:h-[85%]'
				/>
			</SheetContent>
		</Sheet>
	);
}

'use client';

import { GetLog } from '@/types';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import FoodLogList from './log-list';
import { cn, formatDateTime } from '@/lib/utils';
import { CalendarSearch, FileClock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

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
					<FileClock className='w-4 h-4' /> View today&apos;s log
				</Button>
			</SheetTrigger>
			<SheetContent side='left'>
				<SheetTitle className='text-md flex flex-row items-center justify-center gap-2 pb-2'>
					<CalendarSearch className='w-4 h-4' />
					{formatDateTime(log.createdAt).dateOnly}
				</SheetTitle>

				<FoodLogList iconPosition='top' />
			</SheetContent>
		</Sheet>
	);
}

'use client';

import { getCurrentLogQueryOptions } from '@/lib/queries/logQueries';
import { cn, getToday } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarSearch, FileClock } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import FoodLogList from './log-list';

export default function LogSheet({ onOpen }: { onOpen?: () => void }) {
	const { data: log } = useQuery(getCurrentLogQueryOptions());

	const pathname = usePathname();
	const [isOpen, setIsOpen] = useState(false);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		if (isOpen) {
			onOpen?.();
		}
	}, [isOpen]);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	if (!log || !isMounted) {
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

				<FoodLogList iconPosition='top' />
			</SheetContent>
		</Sheet>
	);
}

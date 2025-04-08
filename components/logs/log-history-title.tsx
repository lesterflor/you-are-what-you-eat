'use client';

import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import LogFilter from './log-filter';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import { Button } from '../ui/button';
import { ChartArea } from 'lucide-react';
import DayLogChart from './day-log-chart';
import { useScrolling } from '@/hooks/use-scroll';

export default function LogHistoryTitle() {
	const { delta, scrollingUp } = useScrolling();

	return (
		<Badge
			variant={'secondary'}
			className={cn(
				'text-md font-normal flex flex-row items-center gap-4 justify-between fixed transition-all top-24 right-0 z-30 duration-1000',
				scrollingUp ? 'top-24' : '-top-24',
				delta === 0 && 'top-24'
			)}>
			<div className='flex flex-row items-center gap-4'>
				<span>History</span>
				<LogFilter />
			</div>
			<div>
				<Dialog>
					<DialogTrigger asChild>
						<Button
							variant={'outline'}
							size='icon'>
							<ChartArea className='w-6 h-6' />
						</Button>
					</DialogTrigger>
					<DialogContent className='max-w-[65vw] min-h-[70vh] max-h-[100vh] portrait:h-[95vh] portrait:max-w-[95vw] portrait:min-h-[75vh] flex flex-col items-start justify-start'>
						<DialogDescription />
						<DialogTitle>Log Data</DialogTitle>
						<DayLogChart />
					</DialogContent>
				</Dialog>
			</div>
		</Badge>
	);
}

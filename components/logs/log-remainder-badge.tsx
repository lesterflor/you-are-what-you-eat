'use client';

import { Info } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { formatUnit } from '@/lib/utils';
import { useContext, useEffect, useState } from 'react';
import { LogRemainderDataType } from '@/types';
import { LogUpdateContext } from '@/contexts/log-context';
import { getLogRemainder } from '@/actions/log-actions';

export default function LogRemainderBadge() {
	const [logRemainder, setLogRemainder] = useState<LogRemainderDataType>();
	const logContext = useContext(LogUpdateContext);

	const getLogCalsRemaining = async () => {
		const res = await getLogRemainder();

		if (res.success && res.data) {
			setLogRemainder(res.data);
		}
	};

	useEffect(() => {
		if (logContext?.updated) {
			getLogCalsRemaining();
		}
	}, [logContext]);

	useEffect(() => {
		getLogCalsRemaining();
	}, []);

	return (
		<>
			{logRemainder && (
				<Popover>
					<PopoverTrigger>
						<Badge
							variant='secondary'
							className='select-none p-1 rounded-md border-2 font-normal text-xs flex flex-row gap-1 items-start'>
							<Info className='w-4 h-4' />
							<div className='flex flex-col gap-0'>
								<span className='whitespace-nowrap'>Cumulative</span>
								<span>{formatUnit(logRemainder.remainder)}</span>
							</div>
						</Badge>
					</PopoverTrigger>
					<PopoverContent className='text-xs text-muted-foreground flex flex-col gap-2'>
						<div className='flex flex-row items-center gap-2'>
							<Info className='w-4 h-4 text-foreground' />
							<span className='text-foreground'>What&apos;s this?</span>
						</div>
						<div>
							The cumulative value are the calories that you left off with from
							yesterday&apos;s total calories consumed, minus your BMR and the
							calories expended that you may or may not have entered.
						</div>
						<div className='grid grid-cols-[75%,25%] gap-2 w-full pt-4'>
							<div>Yesterday&apos;s Calories</div>
							<div className='text-foreground'>
								{formatUnit(logRemainder.yesterdaysConsumed)}
							</div>
							<div>Yesterday&apos;s Expended</div>
							<div className='text-foreground'>
								{formatUnit(logRemainder.yesterdaysExpended)}
							</div>
							<div>Base Metabolic Rate</div>
							<div className='text-foreground'>{logRemainder.bmr}</div>
							<div>Yesterday&apos;s Remainder</div>
							<div className='text-foreground'>
								{formatUnit(logRemainder.yesterdaysRemainder)}
							</div>
							<div>Today&apos; Calories</div>
							<div className='text-foreground'>
								{formatUnit(logRemainder.todaysConsumed)}
							</div>
							<div className='col-span-2'>
								(BMR Calories + Expended Yesterday - Consumed Yesterday) +
								Expended Today - Consumed Today ={' '}
								<span className='text-foreground'>
									{formatUnit(logRemainder.remainder)}
								</span>
							</div>
						</div>
					</PopoverContent>
				</Popover>
			)}
		</>
	);
}

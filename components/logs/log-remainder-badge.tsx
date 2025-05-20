'use client';

import { getLogRemainder } from '@/actions/log-actions';
import { selectStatus } from '@/lib/features/log/logFoodSlice';
import { useAppSelector } from '@/lib/hooks';
import { formatUnit } from '@/lib/utils';
import { LogRemainderDataType } from '@/types';
import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function LogRemainderBadge() {
	const [logRemainder, setLogRemainder] = useState<LogRemainderDataType>();
	const logStatus = useAppSelector(selectStatus);

	const [isFetching, setIsFetching] = useState(false);

	const getLogCalsRemaining = async () => {
		setIsFetching(true);
		const res = await getLogRemainder();

		if (res.success && res.data) {
			setLogRemainder(res.data);
		}
		setIsFetching(false);
	};

	useEffect(() => {
		getLogCalsRemaining();
	}, [logStatus]);

	useEffect(() => {
		getLogCalsRemaining();
	}, []);

	return (
		<>
			{isFetching ? (
				<div className='w-20 h-8 flex flex-col items-center justify-center'>
					<ImSpinner2 className='w-4 h-4 animate-spin opacity-25' />
				</div>
			) : (
				logRemainder && (
					<Popover>
						<PopoverTrigger>
							<Badge
								variant='secondary'
								className='select-none p-1 rounded-md border-2 font-normal text-xs flex flex-row gap-1 items-start'>
								<Info className='w-4 h-4' />
								<div className='flex flex-col gap-0'>
									<span className='whitespace-nowrap'>Cumulative</span>
									<div className='flex flex-row gap-1 items-center'>
										{Math.sign(formatUnit(logRemainder.remainder)) === -1 ? (
											<ArrowUp className='w-3 h-3 text-red-600 animate-bounce' />
										) : (
											<ArrowDown className='w-3 h-3 text-green-600 animate-bounce' />
										)}
										<span>{Math.abs(formatUnit(logRemainder.remainder))}</span>
									</div>
								</div>
							</Badge>
						</PopoverTrigger>
						<PopoverContent className='text-xs text-muted-foreground flex flex-col gap-2'>
							<div className='flex flex-row items-center gap-2'>
								<Info className='w-4 h-4 text-foreground' />
								<span className='text-foreground'>What&apos;s this?</span>
							</div>
							<div>
								The cumulative value are the calories that you left off with
								from yesterday&apos;s total calories consumed, minus your BMR
								and the calories expended that you may or may not have entered.
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
				)
			)}
		</>
	);
}

'use client';

import { addKnownCaloriesBurned, createDailyLog } from '@/actions/log-actions';
import { useCurrentSession } from '@/hooks/use-current-session';
import {
	expendedCaloriesUpdated,
	selectData,
	selectStatus
} from '@/lib/features/log/logFoodSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { GetLog } from '@/types';
import { ChevronLeft, ChevronRight, Flame, Plus } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';

export default function ExpendedCaloriesButton({
	children
}: {
	children?: React.ReactNode;
}) {
	const dispatch = useAppDispatch();
	const logStatus = useAppSelector(selectStatus);
	const logData = useAppSelector(selectData);

	const [log, setLog] = useState<GetLog>();
	const [caloriesBurned, setCaloriesBurned] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [inputVal, setInputVal] = useState(10);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const [ref, inView] = useInView();

	const { status } = useCurrentSession();

	const getLog = useCallback(async () => {
		setFetching(true);
		const res = await createDailyLog();

		if (res?.success && res.data) {
			setLog(res.data as GetLog);
		}

		setFetching(false);
	}, [log]);

	useEffect(() => {
		if (inView) {
			getLog();
		}
	}, [inView]);

	useEffect(() => {
		if (logStatus !== 'idle') {
			getLog();
		}
	}, [logData, logStatus]);

	useEffect(() => {
		if (log?.knownCaloriesBurned && log.knownCaloriesBurned.length > 0) {
			setCaloriesBurned(log.knownCaloriesBurned[0].calories);
		}
	}, [log]);

	if (status !== 'authenticated') {
		return null;
	}

	return (
		<Popover
			open={popoverOpen}
			onOpenChange={setPopoverOpen}>
			<PopoverTrigger asChild>{children}</PopoverTrigger>
			<PopoverContent
				ref={ref}
				className='flex flex-col gap-6 items-center justify-center'>
				<div className='flex flex-row items-center gap-2'>
					<Flame className='w-6 h-6' />
					Expended Calories
				</div>
				<div className='text-3xl font-semibold text-amber-600'>
					{fetching ? (
						<ImSpinner2 className='w-7 h-7 animate-spin' />
					) : (
						caloriesBurned
					)}
				</div>
				<div className='flex flex-row items-center justify-between gap-4 w-full'>
					<div className='flex flex-col gap-4 items-center justify-center w-full'>
						<div className='text-xs text-muted-foreground'>{inputVal}</div>
						<div className='flex flex-row items-center gap-3 justify-center w-full'>
							<Button
								onClick={() => {
									setInputVal((prev) => prev - 1);
								}}
								size={'icon'}
								variant={'secondary'}>
								<ChevronLeft />
							</Button>
							<Slider
								value={[inputVal]}
								defaultValue={[inputVal]}
								onValueChange={(val) => setInputVal(val[0])}
								step={1}
								min={-caloriesBurned}
								max={1000}
							/>
							<Button
								onClick={() => {
									setInputVal((prev) => prev + 1);
								}}
								size={'icon'}
								variant={'secondary'}>
								<ChevronRight />
							</Button>
						</div>
					</div>
				</div>

				<Button
					disabled={submitting}
					onClick={async () => {
						setSubmitting(true);
						const res = await addKnownCaloriesBurned(inputVal);

						if (res.success) {
							toast.success(res.message);
							getLog();

							// redux
							dispatch(expendedCaloriesUpdated(inputVal));

							setInputVal(0);
							setPopoverOpen(false);
						} else {
							toast.error(res.message);
						}

						setSubmitting(false);
					}}>
					{submitting ? (
						<ImSpinner2 className='w-4 h-4 animate-spin' />
					) : (
						<Plus className='h-4 w-4' />
					)}
					Add
				</Button>

				<div className='text-muted-foreground text-xs'>
					* If you are aware of calories you have burned outside your BMR (Base
					Metabolic Rate), enter it here. You can add more at any time to keep
					adding to the calories you have burned throughout the day.
				</div>
			</PopoverContent>
		</Popover>
	);
}

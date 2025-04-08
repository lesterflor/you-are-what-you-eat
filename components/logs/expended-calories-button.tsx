'use client';

import { Flame, Plus } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { useEffect, useState } from 'react';
import { useCurrentSession } from '@/hooks/use-current-session';
import { addKnownCaloriesBurned, createDailyLog } from '@/actions/log-actions';
import { GetLog } from '@/types';
import { FaSpinner } from 'react-icons/fa';
import { Slider } from '../ui/slider';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import {
	expendedCaloriesUpdated,
	selectData,
	selectStatus
} from '@/lib/features/log/logFoodSlice';

export default function ExpendedCaloriesButton({
	iconMode = true
}: {
	iconMode?: boolean;
}) {
	const dispatch = useAppDispatch();
	const logStatus = useAppSelector(selectStatus);
	const logData = useAppSelector(selectData);

	const [log, setLog] = useState<GetLog>();
	const [caloriesBurned, setCaloriesBurned] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [inputVal, setInputVal] = useState(0);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const { status } = useCurrentSession();

	const getLog = async () => {
		setFetching(true);
		const res = await createDailyLog();

		if (res?.success && res.data) {
			setLog(res.data as GetLog);
		}

		setFetching(false);
	};

	useEffect(() => {
		getLog();
	}, []);

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
			<PopoverTrigger asChild>
				{iconMode ? (
					<div className='mt-2 rounded-full p-2 bg-amber-700 w-10 h-10 flex flex-col items-center justify-center'>
						<Flame className='w-6 h-6 animate-pulse' />
					</div>
				) : (
					<Button>
						<Flame className='w-4 h-4' />
						Expended Calories
					</Button>
				)}
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-6 items-center justify-center'>
				<div className='flex flex-row items-center gap-2'>
					<Flame className='w-6 h-6' />
					Expended Calories
				</div>
				<div className='text-3xl font-semibold text-amber-600'>
					{fetching ? (
						<FaSpinner className='w-6 h-6 animate-spin' />
					) : (
						caloriesBurned
					)}
				</div>
				<div className='flex flex-row items-center justify-between gap-4 w-full'>
					<div className='flex flex-col gap-4 items-center justify-center w-full'>
						<Slider
							defaultValue={[inputVal]}
							onValueChange={(val) => setInputVal(val[0])}
							step={1}
							max={1500}
						/>
						<div className='text-xs text-muted-foreground'>{inputVal}</div>
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
							<FaSpinner className='w-4 h-4 animate-spin' />
						) : (
							<Plus className='h-4 w-4' />
						)}
						Add
					</Button>
				</div>

				<div className='text-muted-foreground text-xs'>
					* If you are aware of calories you have burned outside your BMR (Base
					Metabolic Rate), enter it here. You can add more at any time to keep
					adding to the calories you have burned throughout the day.
				</div>
			</PopoverContent>
		</Popover>
	);
}

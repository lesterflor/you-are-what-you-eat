'use client';

import {
	addKnownCaloriesBurned,
	getKnownCaloriesBurned
} from '@/actions/log-actions';
import {
	expendedCaloriesUpdated,
	selectData,
	selectStatus
} from '@/lib/features/log/logFoodSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { ChevronLeft, ChevronRight, Flame, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import IncrementButton from '../increment-button';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Slider } from '../ui/slider';

export default function ExpendedCaloriesButton({
	children,
	showBalloon = false
}: {
	children?: React.ReactNode;
	showBalloon?: boolean;
}) {
	const dispatch = useAppDispatch();
	const logStatus = useAppSelector(selectStatus);
	const logData = useAppSelector(selectData);

	//const [log, setLog] = useState<GetLog>();
	const [caloriesBurned, setCaloriesBurned] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [fetching, setFetching] = useState(true);
	const [inputVal, setInputVal] = useState(10);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const getKnownCalories = async () => {
		setFetching(true);
		const res = await getKnownCaloriesBurned();

		if (res?.success && res.data) {
			setCaloriesBurned(res.data.calories);
		}

		setFetching(false);
	};

	useEffect(() => {
		getKnownCalories();
	}, []);

	useEffect(() => {
		if (logStatus !== 'idle') {
			getKnownCalories();
		}
	}, [logData, logStatus]);

	// useEffect(() => {
	// 	if (log?.knownCaloriesBurned && log.knownCaloriesBurned.length > 0) {
	// 		setCaloriesBurned(log.knownCaloriesBurned[0].calories);
	// 	}
	// }, [log]);

	return (
		<Popover
			open={popoverOpen}
			onOpenChange={setPopoverOpen}>
			<PopoverTrigger asChild>
				<div className='relative'>
					{children}
					{showBalloon && !popoverOpen && caloriesBurned > 0 && (
						<div className='absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
							{caloriesBurned}
						</div>
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-6 items-center justify-center'>
				<div className='flex flex-row items-center gap-2'>
					<Flame className='w-6 h-6' />
					Expended Calories
				</div>
				<div className='text-3xl font-semibold text-amber-600 h-6 flex flex-col items-center justify-center'>
					{fetching ? <ImSpinner2 className='animate-spin' /> : caloriesBurned}
				</div>
				<div className='flex flex-row items-center justify-between gap-4 w-full'>
					<div className='flex flex-col gap-4 items-center justify-center w-full'>
						<div className='text-xs text-muted-foreground'>{inputVal}</div>
						<div className='flex flex-row items-center gap-3 justify-center w-full'>
							<IncrementButton
								increment={1}
								allowLongPress={true}
								onChange={() => {
									setInputVal((prev) => prev - 1);
								}}>
								<ChevronLeft />
							</IncrementButton>

							<Slider
								value={[inputVal]}
								defaultValue={[inputVal]}
								onValueChange={(val) => setInputVal(val[0])}
								step={1}
								min={-caloriesBurned}
								max={1000}
							/>

							<IncrementButton
								increment={1}
								allowLongPress={true}
								onChange={() => {
									setInputVal((prev) => prev + 1);
								}}>
								<ChevronRight />
							</IncrementButton>
						</div>
					</div>
				</div>

				<Button
					className='select-none'
					disabled={submitting}
					onClick={async () => {
						setSubmitting(true);
						const res = await addKnownCaloriesBurned(inputVal);

						if (res.success && res.data) {
							toast.success(res.message);

							setCaloriesBurned(res.data.calories);

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

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
import { useEffect, useOptimistic, useState, useTransition } from 'react';
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

	const [isPending, startPendingTransition] = useTransition();

	const [caloriesBurned, setCaloriesBurned] = useState(0);
	const [optimisticCalories, setOptimisticCalories] = useOptimistic(
		caloriesBurned,
		(currentCalories, optimisticValue: number) =>
			currentCalories + optimisticValue
	);

	const [fetching, startFetchingTransition] = useTransition();
	const [inputVal, setInputVal] = useState(10);
	const [popoverOpen, setPopoverOpen] = useState(false);

	const getKnownCalories = async () => {
		startFetchingTransition(async () => {
			const res = await getKnownCaloriesBurned();

			if (res?.success && res.data) {
				startFetchingTransition(() => {
					setCaloriesBurned(res.data.calories);
				});
			}
		});
	};

	useEffect(() => {
		getKnownCalories();
	}, []);

	useEffect(() => {
		if (logStatus !== 'idle') {
			getKnownCalories();
		}
	}, [logData, logStatus]);

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
			<PopoverContent className='flex flex-col gap-6 items-center justify-center select-none'>
				<div className='flex flex-row items-center gap-2'>
					<Flame className='w-6 h-6' />
					Expended Calories
				</div>
				<div className='text-3xl font-semibold text-amber-600 h-6 flex flex-col items-center justify-center'>
					{fetching ? (
						<ImSpinner2 className='animate-spin' />
					) : (
						optimisticCalories
					)}
				</div>
				<div className='flex flex-row items-center justify-between gap-4 w-full select-none'>
					<div className='flex flex-col gap-4 items-center justify-center w-full'>
						<div className='text-xs text-muted-foreground'>{inputVal}</div>
						<div
							className='flex flex-row items-center gap-3 justify-center w-full'
							onContextMenu={(e) => {
								e.preventDefault();
							}}>
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
								max={1100}
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

				<div className='flex flex-row gap-2 select-none'>
					<Button
						variant={'secondary'}
						onClick={() => setInputVal(350)}>
						350
					</Button>
					<Button
						variant={'secondary'}
						onClick={() => setInputVal(500)}>
						500
					</Button>
					<Button
						variant={'secondary'}
						onClick={() => setInputVal(750)}>
						750
					</Button>
					<Button
						variant={'secondary'}
						onClick={() => setInputVal(1050)}>
						1050
					</Button>
				</div>

				<Button
					className='select-none'
					disabled={isPending}
					onClick={() => {
						startPendingTransition(async () => {
							setOptimisticCalories(inputVal);

							try {
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
							} catch (err) {
								console.error(`failed to add calories: ${err}`);
							}
						});
					}}>
					{isPending ? (
						<ImSpinner2 className='w-4 h-4 animate-spin' />
					) : (
						<Plus className='h-4 w-4' />
					)}
					Add
				</Button>

				<div className='text-muted-foreground text-xs select-none'>
					* If you are aware of calories you have burned outside your BMR (Base
					Metabolic Rate), enter it here. You can add more at any time to keep
					adding to the calories you have burned throughout the day.
				</div>
			</PopoverContent>
		</Popover>
	);
}

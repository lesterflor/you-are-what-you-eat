'use client';

import { expendedCaloriesUpdated } from '@/lib/features/log/logFoodSlice';
import { logCaloriesBurnedMutationOptions } from '@/lib/features/mutations/logMutations';
import { useAppDispatch } from '@/lib/hooks';
import {
	getCurrentLogQueryOptions,
	getLogRemainderQueryOptions
} from '@/lib/queries/logQueries';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Flame, InfoIcon, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FaWalking } from 'react-icons/fa';
import { GiWeightLiftingUp } from 'react-icons/gi';
import { ImSpinner2 } from 'react-icons/im';
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
	const query = useQueryClient();

	const { mutate: logCalories, isPending: isLoggingCalories } = useMutation(
		logCaloriesBurnedMutationOptions()
	);

	const { data: logData } = useQuery(getCurrentLogQueryOptions());

	const dispatch = useAppDispatch();

	const [inputVal, setInputVal] = useState(10);
	const [popoverOpen, setPopoverOpen] = useState(false);

	useEffect(() => {
		if (!popoverOpen) {
			setInputVal(10);
		}
	}, [popoverOpen]);

	return (
		<Popover
			open={popoverOpen}
			onOpenChange={setPopoverOpen}>
			<PopoverTrigger asChild>
				<div className='relative'>
					{children}
					{showBalloon &&
						!popoverOpen &&
						logData &&
						logData.macros.caloriesBurned > 0 && (
							<div className='absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
								{logData.macros.caloriesBurned}
							</div>
						)}
				</div>
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-6 items-center justify-center select-none relative w-[85vw] bg-slate-950'>
				<Popover>
					<PopoverTrigger asChild>
						<div className='absolute top-2 left-2'>
							<InfoIcon className='w-6 h-6 opacity-30' />
						</div>
					</PopoverTrigger>
					<PopoverContent>
						<div className='text-muted-foreground text-xs select-none'>
							* If you are aware of calories you have burned outside your BMR
							(Base Metabolic Rate), enter it here. You can add more at any time
							to keep adding to the calories you have burned throughout the day.
						</div>
					</PopoverContent>
				</Popover>

				<div className='flex flex-row items-center gap-2'>
					<Flame className='w-6 h-6' />
					Expended Calories
				</div>
				<div className='text-3xl font-semibold text-amber-600 h-6 flex flex-col items-center justify-center'>
					{logData?.macros.caloriesBurned}
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
								min={-(logData?.macros.caloriesBurned ?? 0)}
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

				<div className='flex flex-row flex-wrap gap-2 select-none'>
					<Button
						variant={'secondary'}
						onClick={() => setInputVal(100)}>
						100
					</Button>
					<Button
						variant={'secondary'}
						onClick={() => setInputVal(150)}>
						150
					</Button>
					<Button
						variant={'secondary'}
						onClick={() => setInputVal(250)}>
						250
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
					<Button
						className='px-1.5 gap-1'
						variant={'secondary'}
						onClick={() => setInputVal(350)}>
						<FaWalking />
						<span className='text-muted-foreground text-xs'>
							(1 H, 5 kph)
						</span>{' '}
						350
					</Button>
					<Button
						className='px-1.5 gap-1'
						variant={'secondary'}
						onClick={() => setInputVal(370)}>
						<FaWalking />
						<span className='text-muted-foreground text-xs'>
							(1 H, 5.5 kph)
						</span>{' '}
						370
					</Button>

					<Button
						className='px-1.5 gap-1'
						variant={'secondary'}
						onClick={() => setInputVal(200)}>
						<GiWeightLiftingUp />
						<span className='text-muted-foreground text-xs'>
							(1 H, light)
						</span>{' '}
						200
					</Button>
					<Button
						className='px-1.5 gap-1'
						variant={'secondary'}
						onClick={() => setInputVal(300)}>
						<GiWeightLiftingUp />
						<span className='text-muted-foreground text-xs'>
							(1 H, mod)
						</span>{' '}
						300
					</Button>
				</div>

				<Button
					className='select-none'
					disabled={isLoggingCalories || inputVal === 0}
					onClick={() => {
						logCalories(inputVal, {
							onSuccess: () => {
								dispatch(expendedCaloriesUpdated(inputVal));

								// tanstack
								query.invalidateQueries({
									queryKey: getCurrentLogQueryOptions().queryKey
								});

								// invalidate remainders
								query.invalidateQueries({
									queryKey: getLogRemainderQueryOptions().queryKey
								});

								setInputVal(0);
								setPopoverOpen(false);
							}
						});
					}}>
					{isLoggingCalories ? (
						<ImSpinner2 className='w-4 h-4 animate-spin' />
					) : (
						<Plus className='h-4 w-4' />
					)}
					Add
				</Button>
			</PopoverContent>
		</Popover>
	);
}

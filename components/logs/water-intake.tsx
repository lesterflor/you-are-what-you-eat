'use client';

import { todaysWaterConsumed } from '@/actions/log-actions';
import {
	selectWaterLogData,
	selectWaterLogStatus,
	updatedWater
} from '@/lib/features/log/waterLogSlice';
import {
	selectUserData,
	selectUserDataStatus
} from '@/lib/features/user/userDataSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
	calculateWaterIntake,
	cn,
	colateBMRData,
	formatUnit
} from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import {
	ArrowDown,
	ArrowUp,
	Check,
	ChevronLeft,
	ChevronRight
} from 'lucide-react';
import { useEffect, useOptimistic, useState, useTransition } from 'react';
import { BsCupFill } from 'react-icons/bs';
import { FaGlassWater } from 'react-icons/fa6';
import { GrCircleQuestion } from 'react-icons/gr';
import { ImSpinner2, ImSpinner9 } from 'react-icons/im';
import { IoIosWater } from 'react-icons/io';
import { toast } from 'sonner';
import IncrementButton from '../increment-button';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTrigger
} from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { Slider } from '../ui/slider';

export default function WaterIntake({
	children,
	showBalloon = false,
	useModal = false
}: {
	children?: React.ReactNode;
	showBalloon?: boolean;
	useModal?: boolean;
}) {
	const dispatch = useAppDispatch();
	const waterLogData = useAppSelector(selectWaterLogData);
	const waterLogStatus = useAppSelector(selectWaterLogStatus);

	const userData = useAppSelector(selectUserData);
	const userDataStatus = useAppSelector(selectUserDataStatus);

	useEffect(() => {
		const { weightInKilos, weightInPounds } = colateBMRData(
			JSON.parse(userData.bmrData)
		);

		console.log(JSON.parse(userData.caloricData ?? ''));

		// update only if state update has different data
		if (
			userDataStatus === 'updated' &&
			weightInPounds !== weight.weightInPounds
		) {
			setWeight({
				weightInKilos,
				weightInPounds
			});
		}
	}, [userData, userDataStatus]);

	const [isFetchingWater, setIsFetchingWater] = useTransition();

	const [currentGlasses, setCurrentGlasses] = useState(0);
	const [waterConsumed, setWaterConsumed] = useState<{
		glasses: number;
		ounces: number;
		litres: number;
	}>({
		glasses: 0,
		ounces: 0,
		litres: 0
	});

	const [optWaterConsumed, setOptWaterConsumed] = useOptimistic(
		waterConsumed,
		(state, newWater: number) => ({
			...state,
			glasses: formatUnit(state.glasses + newWater)
		})
	);

	const [weight, setWeight] = useState<{
		weightInKilos: number;
		weightInPounds: number;
	}>({ weightInKilos: 0, weightInPounds: 0 });
	const [waterData, setWaterData] = useState<{
		ounces: number;
		litres: number;
		glasses: number;
	}>({
		ounces: 0,
		litres: 0,
		glasses: 0
	});

	useEffect(() => {
		fetchTodaysWater();
	}, [waterLogData, waterLogStatus]);

	const [popoverOpen, setPopoverOpen] = useState(false);

	const fetchTodaysWater = () => {
		setIsFetchingWater(async () => {
			const res = await todaysWaterConsumed();

			if (res.success && res.data) {
				const { glasses, ounces, litres } = res.data;
				setWaterConsumed({
					glasses,
					ounces,
					litres
				});
			}
		});
	};

	useEffect(() => {
		if (weight && weight.weightInPounds > 0) {
			setWaterData(calculateWaterIntake(weight.weightInPounds));
		}
	}, [weight]);

	const updateWaterConsumed = async () => {
		setIsFetchingWater(() => {
			setOptWaterConsumed(currentGlasses);
		});

		try {
			const res = await todaysWaterConsumed(currentGlasses);

			if (res.success && res.data) {
				const { glasses, ounces, litres } = res.data;

				setCurrentGlasses(0);

				dispatch(
					updatedWater({
						glasses,
						ounces,
						litres
					})
				);

				toast.success(res.message);

				setPopoverOpen(false);
			} else {
				toast.error(res.message);
			}
		} catch (err) {
			console.error(`There was a problem updating water consumed: ${err}`);
			setWaterConsumed(waterConsumed);
		}
	};

	return (
		<>
			{useModal ? (
				<Dialog
					open={popoverOpen}
					onOpenChange={setPopoverOpen}>
					<DialogTrigger asChild>
						<div className='relative'>
							{children}
							{showBalloon && !popoverOpen && waterData && (
								<>
									{isFetchingWater ? (
										<div className='absolute w-auto h-4 rounded-full bg-gray-500 text-xs top-0 right-0 p-1 flex items-center justify-center'>
											<ImSpinner9 className='animate-spin' />
										</div>
									) : (
										<div
											className={cn(
												'absolute w-auto h-4 rounded-full  text-xs top-0 right-0 p-1 flex items-center justify-center',
												waterData.glasses > optWaterConsumed.glasses
													? 'bg-red-700'
													: 'bg-green-800'
											)}>
											{optWaterConsumed.glasses}
										</div>
									)}
								</>
							)}
						</div>
					</DialogTrigger>
					<DialogContent className='flex flex-col gap-2 items-center justify-center max-h-[90vh] !max-w-[95vw] w-[86vw] rounded-md p-2 pt-8'>
						<Popover>
							<PopoverTrigger asChild>
								<GrCircleQuestion className='w-6 h-6 absolute top-2 left-2 text-muted-foreground' />
							</PopoverTrigger>
							<PopoverContent>
								{weight && (
									<div className='text-muted-foreground text-sm'>
										<p>
											The water amounts are the minimum water requirements you
											need a day, based on your weight of{' '}
											<span className='font-bold'>
												{weight.weightInPounds} pounds
											</span>{' '}
											/{' '}
											<span className='font-bold'>
												{weight.weightInKilos} kilograms.
											</span>
										</p>
										<p>
											<b>
												This amount does not take in account water that may be
												included/part of food consumed.
											</b>
										</p>
									</div>
								)}
							</PopoverContent>
						</Popover>

						<DialogTitle className='flex flex-row items-center gap-2 text-lg'>
							<div className='flex flex-row items-center gap-2 text-lg'>
								<div className='flex flex-row gap-0 items-center leading-tight'>
									<IoIosWater className='w-10 h-10 text-blue-600' />
									Daily Water Requirements
								</div>
							</div>
						</DialogTitle>

						<div className='text-blue-600 flex flex-col items-center justify-center w-full'>
							<div className='text-muted-foreground flex flex-col gap-0 items-start justify-center text-sm pb-4'>
								<div>1 cup = 8 ounces / 237 millilitres</div>
								<div>{`1 (6" tall) glass = 16 ounces / ${
									237 * 2
								} millilitres`}</div>
							</div>

							{waterData && (
								<div className='flex flex-row flex-wrap gap-2 items-center justify-center w-full'>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.glasses} <span className='text-sm'>glasses</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.glasses * 2}{' '}
										<span className='text-sm'>cups</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.ounces} <span className='text-sm'>ounces</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.litres} <span className='text-sm'>litres</span>
									</Badge>
								</div>
							)}
						</div>

						{waterData && (
							<div className='flex flex-col gap-4 w-full items-center justify-center'>
								<div className='flex flex-col items-center justify-center gap-0 w-full'>
									<div className='text-blue-600 text-4xl font-extrabold flex flex-row gap-1 items-center justify-evenly w-full'>
										<div className='flex flex-col gap-0'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<FaGlassWater className='w-8 h-8' />
												{optWaterConsumed.glasses}
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Glasses today
											</div>
										</div>

										<div className='flex flex-col gap-0 items-center justify-center'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<BsCupFill className='w-8 h-8' />
												{optWaterConsumed.glasses * 2}
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Cups today
											</div>
										</div>

										{optWaterConsumed.glasses < waterData.glasses ? (
											<ArrowDown className='animate-bounce text-red-600' />
										) : optWaterConsumed.glasses === waterData.glasses ? (
											<Check className='animate-bounce text-green-600' />
										) : (
											<ArrowUp className='animate-bounce text-green-600' />
										)}
									</div>
								</div>

								<Separator />

								<div className='flex flex-col gap-0 items-center justify-center w-full'>
									<div className='text-muted-foreground flex flex-row gap-2 items-center justify-center'>
										<div className='flex flex-row gap-1 w-16 items-center justify-start'>
											<FaGlassWater className='w-6 h-6' /> {currentGlasses}
										</div>

										<div className='flex flex-row gap-1 w-16 items-center justify-start'>
											<BsCupFill className='w-6 h-6' />{' '}
											{formatUnit(currentGlasses * 2)}
										</div>
									</div>
									<div className='flex flex-row items-center gap-3 justify-center w-full'>
										<IncrementButton
											increment={0.1}
											allowLongPress={true}
											onChange={() => {
												setCurrentGlasses((prev) => formatUnit(prev - 0.1));
											}}>
											<ChevronLeft />
										</IncrementButton>

										<Slider
											value={[currentGlasses]}
											defaultValue={[currentGlasses]}
											onValueChange={(val) => setCurrentGlasses(val[0])}
											step={0.1}
											min={-1}
											max={3}
										/>

										<IncrementButton
											increment={0.1}
											allowLongPress={true}
											onChange={() => {
												setCurrentGlasses((prev) => formatUnit(prev + 0.1));
											}}>
											<ChevronRight />
										</IncrementButton>
									</div>

									<div className='pt-3 flex flex-row flex-wrap gap-2 items-center justify-evenly'>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(0.5)}>
											<FaGlassWater />
											0.5 <BsCupFill /> 1
										</Button>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(1)}>
											<FaGlassWater />
											1 <BsCupFill /> 2
										</Button>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(1.5)}>
											<FaGlassWater />
											1.5 <BsCupFill /> 3
										</Button>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(2)}>
											<FaGlassWater />
											2 <BsCupFill /> 4
										</Button>
									</div>
								</div>

								<Button
									disabled={isFetchingWater}
									onClick={() => updateWaterConsumed()}>
									{isFetchingWater ? (
										<ImSpinner2 />
									) : (
										<IoIosWater className='!w-6 !h-6' />
									)}
									Log
								</Button>
							</div>
						)}

						<DialogDescription />
					</DialogContent>
				</Dialog>
			) : (
				<Popover
					open={popoverOpen}
					onOpenChange={setPopoverOpen}>
					<PopoverTrigger asChild>
						<div className='relative'>
							{children}
							{showBalloon && !popoverOpen && waterData && (
								<>
									{isFetchingWater ? (
										<div className='absolute w-auto h-4 rounded-full bg-gray-500 text-xs top-0 right-0 p-1 flex items-center justify-center'>
											<ImSpinner9 className='animate-spin' />
										</div>
									) : (
										<div
											className={cn(
												'absolute w-auto h-4 rounded-full  text-xs top-0 right-0 p-1 flex items-center justify-center',
												waterData.glasses > optWaterConsumed.glasses
													? 'bg-red-700'
													: 'bg-green-800'
											)}>
											{optWaterConsumed.glasses}
										</div>
									)}
								</>
							)}
						</div>
					</PopoverTrigger>
					<PopoverContent className='flex flex-col gap-2 items-center justify-center max-h-[70vh] !max-w-[95vw] w-[86vw] relative'>
						<Popover>
							<PopoverTrigger asChild>
								<GrCircleQuestion className='w-6 h-6 absolute top-2 left-2 text-muted-foreground' />
							</PopoverTrigger>
							<PopoverContent>
								{weight && (
									<div className='text-muted-foreground text-sm'>
										<p>
											The water amounts are the minimum water requirements you
											need a day, based on your weight of{' '}
											<span className='font-bold'>
												{weight.weightInPounds} pounds
											</span>{' '}
											/{' '}
											<span className='font-bold'>
												{weight.weightInKilos} kilograms.
											</span>
										</p>
										<p>
											<b>
												This amount does not take in account water that may be
												included/part of food consumed.
											</b>
										</p>
									</div>
								)}
							</PopoverContent>
						</Popover>

						<div className='flex flex-row items-center gap-2 text-lg'>
							<div className='flex flex-row gap-0 items-center'>
								<IoIosWater className='w-10 h-10 text-blue-600' />
								Daily Water Requirements
							</div>
						</div>

						<div className='text-blue-600 flex flex-col items-center justify-center w-full'>
							<div className='text-muted-foreground flex flex-col gap-0 items-start justify-center text-sm pb-4'>
								<div>1 cup = 8 ounces / 237 millilitres</div>
								<div>{`1 (6" tall) glass = 16 ounces / ${
									237 * 2
								} millilitres`}</div>
							</div>

							{waterData && (
								<div className='flex flex-row flex-wrap gap-2 items-center justify-center w-full'>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.glasses} <span className='text-sm'>glasses</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.glasses * 2}{' '}
										<span className='text-sm'>cups</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.ounces} <span className='text-sm'>ounces</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
										{waterData.litres} <span className='text-sm'>litres</span>
									</Badge>
								</div>
							)}
						</div>

						{waterData && (
							<div className='flex flex-col gap-4 w-full items-center justify-center'>
								<div className='flex flex-col items-center justify-center gap-0 w-full'>
									<div className='text-blue-600 text-4xl font-extrabold flex flex-row gap-1 items-center justify-evenly w-full'>
										<div className='flex flex-col gap-0'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<FaGlassWater className='w-8 h-8' />
												{optWaterConsumed.glasses}
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Glasses today
											</div>
										</div>

										<div className='flex flex-col gap-0 items-center justify-center'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<BsCupFill className='w-8 h-8' />
												{optWaterConsumed.glasses * 2}
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Cups today
											</div>
										</div>

										{optWaterConsumed.glasses < waterData.glasses ? (
											<ArrowDown className='animate-bounce text-red-600' />
										) : optWaterConsumed.glasses === waterData.glasses ? (
											<Check className='animate-bounce text-green-600' />
										) : (
											<ArrowUp className='animate-bounce text-green-600' />
										)}
									</div>
								</div>

								<Separator />

								<div className='flex flex-col gap-0 items-center justify-center w-full'>
									<div className='text-muted-foreground flex flex-row gap-2 items-center justify-center'>
										<div className='flex flex-row gap-1 w-16 items-center justify-start'>
											<FaGlassWater className='w-6 h-6' /> {currentGlasses}
										</div>

										<div className='flex flex-row gap-1 w-16 items-center justify-start'>
											<BsCupFill className='w-6 h-6' />{' '}
											{formatUnit(currentGlasses * 2)}
										</div>
									</div>
									<div className='flex flex-row items-center gap-3 justify-center w-full'>
										<IncrementButton
											increment={0.1}
											allowLongPress={true}
											onChange={() => {
												setCurrentGlasses((prev) => formatUnit(prev - 0.1));
											}}>
											<ChevronLeft />
										</IncrementButton>

										<Slider
											value={[currentGlasses]}
											defaultValue={[currentGlasses]}
											onValueChange={(val) => setCurrentGlasses(val[0])}
											step={0.1}
											min={-1}
											max={3}
										/>

										<IncrementButton
											increment={0.1}
											allowLongPress={true}
											onChange={() => {
												setCurrentGlasses((prev) => formatUnit(prev + 0.1));
											}}>
											<ChevronRight />
										</IncrementButton>
									</div>

									<div className='pt-3 flex flex-row flex-wrap gap-2 items-center justify-evenly'>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(0.5)}>
											<FaGlassWater />
											0.5 <BsCupFill /> 1
										</Button>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(1)}>
											<FaGlassWater />
											1 <BsCupFill /> 2
										</Button>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(1.5)}>
											<FaGlassWater />
											1.5 <BsCupFill /> 3
										</Button>
										<Button
											className='px-2 gap-1'
											variant={'secondary'}
											onClick={() => setCurrentGlasses(2)}>
											<FaGlassWater />
											2 <BsCupFill /> 4
										</Button>
									</div>
								</div>

								<Button
									disabled={isFetchingWater}
									onClick={() => updateWaterConsumed()}>
									{isFetchingWater ? (
										<ImSpinner2 />
									) : (
										<IoIosWater className='!w-6 !h-6' />
									)}
									Log
								</Button>
							</div>
						)}
					</PopoverContent>
				</Popover>
			)}
		</>
	);
}

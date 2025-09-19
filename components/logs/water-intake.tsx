'use client';

import { logWaterMutationOptions } from '@/lib/features/mutations/waterMutations';
import { getCurrentLogQueryOptions } from '@/lib/queries/logQueries';
import { getCurrentWaterQueryOptions } from '@/lib/queries/waterQueries';
import { calculateWaterIntake, cn, formatUnit } from '@/lib/utils';
import { DialogTitle } from '@radix-ui/react-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
	ArrowDown,
	ArrowUp,
	Check,
	ChevronLeft,
	ChevronRight
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { BsCupFill } from 'react-icons/bs';
import { FaGlassWater } from 'react-icons/fa6';
import { GrCircleQuestion } from 'react-icons/gr';
import { ImSpinner2 } from 'react-icons/im';
import { IoIosWater } from 'react-icons/io';
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
	const query = useQueryClient();
	const { data: waterLogData } = useQuery(getCurrentWaterQueryOptions());
	const { data: logData } = useQuery(getCurrentLogQueryOptions());
	const { mutate: logWater, isPending: isLoggingWater } = useMutation(
		logWaterMutationOptions()
	);

	const [currentGlasses, setCurrentGlasses] = useState(0);

	const [popoverOpen, setPopoverOpen] = useState(false);

	const waterData = calculateWaterIntake(logData?.bmrData.weightInPounds ?? 0);

	useEffect(() => {
		if (!popoverOpen) {
			setCurrentGlasses(0);
		}
	}, [popoverOpen]);

	const updateWaterConsumed = async () => {
		// tanstack
		logWater(currentGlasses, {
			onSuccess: async () => {
				await query.invalidateQueries({
					queryKey: getCurrentWaterQueryOptions().queryKey
				});

				setCurrentGlasses(0);
				setPopoverOpen(false);
			}
		});
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
								<div
									className={cn(
										'absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center',
										waterLogData &&
											waterLogData.glasses >= waterData.glasses &&
											waterLogData.glasses !== 0 &&
											'bg-green-700'
									)}>
									{waterLogData?.glasses ?? 0}
								</div>
							)}
						</div>
					</DialogTrigger>
					<DialogContent className='flex flex-col gap-2 items-center justify-center max-h-[90vh] !max-w-[95vw] w-[86vw] rounded-md p-2 pt-8'>
						<Popover>
							<PopoverTrigger asChild>
								<GrCircleQuestion className='w-6 h-6 absolute top-2 left-2 text-muted-foreground' />
							</PopoverTrigger>
							<PopoverContent>
								{logData?.bmrData && (
									<div className='text-muted-foreground text-sm'>
										<p>
											The water amounts are the minimum water requirements you
											need a day, based on your weight of{' '}
											<span className='font-bold'>
												{logData.bmrData.weightInPounds} pounds
											</span>{' '}
											/{' '}
											<span className='font-bold'>
												{logData.bmrData.weightInKilos} kilograms.
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
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.glasses} <span className='text-sm'>glasses</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.glasses * 2}{' '}
										<span className='text-sm'>cups</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.ounces} <span className='text-sm'>ounces</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.litres} <span className='text-sm'>litres</span>
									</Badge>
								</div>
							)}
						</div>

						{waterLogData && (
							<div className='flex flex-col gap-4 w-full items-center justify-center'>
								<div className='flex flex-col items-center justify-center gap-0 w-full'>
									<div className='text-blue-600 text-4xl font-extrabold flex flex-row gap-1 items-center justify-evenly w-full'>
										<div className='flex flex-col gap-0'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<FaGlassWater className='w-8 h-8' />
												<span className='text-foreground'>
													{waterLogData.glasses}
												</span>
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Glasses today
											</div>
										</div>

										<div className='text-muted-foreground font-normal'>=</div>

										<div className='flex flex-col gap-0 items-center justify-center'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<BsCupFill className='w-8 h-8' />
												<span className='text-foreground'>
													{waterLogData.glasses * 2}
												</span>
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Cups today
											</div>
										</div>

										{waterLogData.glasses < waterData.glasses ? (
											<ArrowDown className='animate-bounce text-red-600' />
										) : waterLogData.glasses === waterData.glasses ? (
											<Check className='animate-bounce text-green-600' />
										) : (
											<ArrowUp className='animate-bounce text-green-600' />
										)}
									</div>
								</div>

								<Separator />

								<div className='flex flex-col gap-0 items-center justify-center w-full'>
									<div className='text-muted-foreground flex flex-row gap-2 items-center justify-center'>
										<div
											className={cn(
												'flex flex-row gap-1 w-16 items-center justify-start',
												currentGlasses !== 0 && 'text-green-400 animate-pulse'
											)}>
											<FaGlassWater className='w-6 h-6' /> {currentGlasses}
										</div>

										<div
											className={cn(
												'flex flex-row gap-1 w-16 items-center justify-start',
												currentGlasses !== 0 && 'text-green-400 animate-pulse'
											)}>
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
									disabled={isLoggingWater || currentGlasses === 0}
									onClick={() => updateWaterConsumed()}>
									{isLoggingWater ? (
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
								<div
									className={cn(
										'absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center',
										waterLogData &&
											waterLogData.glasses >= waterData.glasses &&
											waterLogData.glasses !== 0 &&
											'bg-green-700'
									)}>
									{waterLogData?.glasses}
								</div>
							)}
						</div>
					</PopoverTrigger>
					<PopoverContent className='flex flex-col gap-2 items-center justify-center max-h-[70vh] !max-w-[95vw] w-[86vw] relative'>
						<Popover>
							<PopoverTrigger asChild>
								<GrCircleQuestion className='w-6 h-6 absolute top-2 left-2 text-muted-foreground' />
							</PopoverTrigger>
							<PopoverContent>
								{logData?.bmrData && (
									<div className='text-muted-foreground text-sm'>
										<p>
											The water amounts are the minimum water requirements you
											need a day, based on your weight of{' '}
											<span className='font-bold'>
												{logData.bmrData.weightInPounds} pounds
											</span>{' '}
											/{' '}
											<span className='font-bold'>
												{logData.bmrData.weightInKilos} kilograms.
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
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.glasses} <span className='text-sm'>glasses</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.glasses * 2}{' '}
										<span className='text-sm'>cups</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.ounces} <span className='text-sm'>ounces</span>
									</Badge>
									<Badge
										variant={'outline'}
										className='flex flex-col !gap-0 items-center bg-blue-800 text-white font-normal'>
										{waterData.litres} <span className='text-sm'>litres</span>
									</Badge>
								</div>
							)}
						</div>

						{waterLogData && (
							<div className='flex flex-col gap-4 w-full items-center justify-center'>
								<div className='flex flex-col items-center justify-center gap-0 w-full'>
									<div className='text-blue-600 text-4xl font-extrabold flex flex-row gap-1 items-center justify-evenly w-full'>
										<div className='flex flex-col gap-0'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<FaGlassWater className='w-8 h-8' />
												<span className='text-foreground'>
													{waterLogData.glasses}
												</span>
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Glasses today
											</div>
										</div>

										<div className='text-muted-foreground font-normal'>=</div>

										<div className='flex flex-col gap-0 items-center justify-center'>
											<div className='flex flex-row gap-1 items-center justify-center'>
												<BsCupFill className='w-8 h-8' />
												<span className='text-foreground'>
													{waterLogData.glasses * 2}
												</span>
											</div>
											<div className='text-xs font-normal text-muted-foreground'>
												Cups today
											</div>
										</div>

										{waterLogData.glasses < waterData.glasses ? (
											<ArrowDown className='animate-bounce text-red-600' />
										) : waterLogData.glasses === waterData.glasses ? (
											<Check className='animate-bounce text-green-600' />
										) : (
											<ArrowUp className='animate-bounce text-green-600' />
										)}
									</div>
								</div>

								<Separator />

								<div className='flex flex-col gap-0 items-center justify-center w-full'>
									<div className='text-muted-foreground flex flex-row gap-2 items-center justify-center'>
										<div
											className={cn(
												'flex flex-row gap-1 w-16 items-center justify-start',
												currentGlasses !== 0 && 'text-green-400 animate-pulse'
											)}>
											<FaGlassWater className='w-6 h-6' /> {currentGlasses}
										</div>

										<div
											className={cn(
												'flex flex-row gap-1 w-16 items-center justify-start',
												currentGlasses !== 0 && 'text-green-400 animate-pulse'
											)}>
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
									disabled={isLoggingWater || currentGlasses === 0}
									onClick={updateWaterConsumed}>
									{isLoggingWater ? (
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

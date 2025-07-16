'use client';

import { getUserBMR } from '@/actions/bmr-actions';
import { todaysWaterConsumed } from '@/actions/log-actions';
import {
	calculateWaterIntake,
	cn,
	colateBMRData,
	formatUnit
} from '@/lib/utils';
import { BMRData } from '@/types';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { BsCupFill } from 'react-icons/bs';
import { FaGlassWater } from 'react-icons/fa6';
import { ImSpinner2 } from 'react-icons/im';
import { IoIosWater } from 'react-icons/io';
import IncrementButton from '../increment-button';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Separator } from '../ui/separator';
import { Skeleton } from '../ui/skeleton';
import { Slider } from '../ui/slider';

export default function WaterIntake({
	children,
	showBalloon = false
}: {
	children?: React.ReactNode;
	showBalloon?: boolean;
}) {
	const [isFetching, setIsFetching] = useTransition();
	const [isFetchingWater, setIsFetchingWater] = useTransition();

	const [currentGlasses, setCurrentGlasses] = useState(0);
	const [waterConsumed, setWaterConsumed] = useState<{
		glasses: number;
		ounces: number;
		litres: number;
	}>();

	const [weight, setWeight] = useState<{
		weightInKilos: number;
		weightInPounds: number;
	}>();
	const [waterData, setWaterData] = useState<{
		ounces: number;
		litres: number;
		glasses: number;
	}>();

	useEffect(() => {
		fetchBMR();
		fetchTodaysWater();
	}, []);

	const [popoverOpen, setPopoverOpen] = useState(false);

	const fetchBMR = () => {
		setIsFetching(async () => {
			const res = await getUserBMR();

			if (res.success && res.data) {
				const { weightInKilos, weightInPounds } = colateBMRData(
					res.data as BMRData
				);

				setWeight({ weightInKilos, weightInPounds });
			}
		});
	};

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

	return (
		<Popover
			open={popoverOpen}
			onOpenChange={setPopoverOpen}>
			<PopoverTrigger asChild>
				<div className='relative'>
					{children}
					{showBalloon && !popoverOpen && waterData && (
						<div
							className={cn(
								'absolute w-auto h-4 rounded-full  text-xs top-0 right-0 p-1 flex items-center justify-center',
								waterConsumed && waterData.glasses > waterConsumed?.glasses
									? 'bg-red-700'
									: 'bg-green-800'
							)}>
							{waterConsumed?.glasses ?? 0}
						</div>
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-4 items-center justify-center max-h-[70vh] !max-w-[95vw] w-[80vw]'>
				<div className='flex flex-row items-center gap-2 text-xl'>
					<IoIosWater className='w-10 h-10 text-blue-600' />
					Daily Water Requirements
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
								{isFetching ? (
									<>
										<Skeleton className='w-6 h-5' />
										<Skeleton className='w-11 h-4' />
									</>
								) : (
									<>
										{waterData.glasses} <span className='text-sm'>glasses</span>
									</>
								)}
							</Badge>
							<Badge
								variant={'outline'}
								className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
								{isFetching ? (
									<>
										<Skeleton className='w-6 h-5' />
										<Skeleton className='w-11 h-4' />
									</>
								) : (
									<>
										{waterData.glasses * 2}{' '}
										<span className='text-sm'>cups</span>
									</>
								)}
							</Badge>
							<Badge
								variant={'outline'}
								className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
								{isFetching ? (
									<>
										<Skeleton className='w-6 h-5' />
										<Skeleton className='w-11 h-4' />
									</>
								) : (
									<>
										{waterData.ounces} <span className='text-sm'>ounces</span>
									</>
								)}
							</Badge>
							<Badge
								variant={'outline'}
								className='flex flex-col !gap-0 items-center bg-blue-800 text-background'>
								{isFetching ? (
									<>
										<Skeleton className='w-6 h-5' />
										<Skeleton className='w-11 h-4' />
									</>
								) : (
									<>
										{waterData.litres} <span className='text-sm'>litres</span>
									</>
								)}
							</Badge>
						</div>
					)}
				</div>

				{waterConsumed && waterData && (
					<div className='flex flex-col gap-4 w-full items-center justify-center'>
						<div className='flex flex-col items-center justify-center gap-0 w-full'>
							<div className='text-blue-600 text-4xl font-extrabold flex flex-row gap-1 items-center justify-evenly w-full'>
								<div className='flex flex-col gap-0'>
									<div className='flex flex-row gap-1 items-center justify-center'>
										<FaGlassWater className='w-8 h-8' />
										{waterConsumed.glasses}
									</div>
									<div className='text-xs font-normal text-muted-foreground'>
										Glasses today
									</div>
								</div>

								<div className='flex flex-col gap-0 items-center justify-center'>
									<div className='flex flex-row gap-1 items-center justify-center'>
										<BsCupFill className='w-8 h-8' />
										{waterConsumed.glasses * 2}
									</div>
									<div className='text-xs font-normal text-muted-foreground'>
										Cups today
									</div>
								</div>

								{waterConsumed.glasses < waterData.glasses ? (
									<ArrowDown className='animate-bounce text-red-600' />
								) : (
									<ArrowUp className='animate-bounce text-green-600' />
								)}
							</div>
						</div>

						<Separator />

						<div className='flex flex-col gap-0 items-center justify-center w-full'>
							<div className='text-muted-foreground flex flex-row gap-1 items-center justify-center'>
								<FaGlassWater className='w-6 h-6' /> {currentGlasses}
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
									min={-10}
									max={30}
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

							<div className='flex flex-row flex-wrap gap-2 items-center justify-center'>
								<FaGlassWater className='w-6 h-6' />
								<Button
									variant={'secondary'}
									onClick={() => setCurrentGlasses(0.5)}>
									0.5
								</Button>
								<Button
									variant={'secondary'}
									onClick={() => setCurrentGlasses(1)}>
									1
								</Button>
								<Button
									variant={'secondary'}
									onClick={() => setCurrentGlasses(1.5)}>
									1.5
								</Button>
								<Button
									variant={'secondary'}
									onClick={() => setCurrentGlasses(2)}>
									2
								</Button>
								<Button
									variant={'secondary'}
									onClick={() => setCurrentGlasses(2.5)}>
									2.5
								</Button>
								<Button
									variant={'secondary'}
									onClick={() => setCurrentGlasses(3)}>
									3
								</Button>
							</div>
						</div>

						<Button
							disabled={isFetchingWater}
							onClick={() => {
								setIsFetchingWater(async () => {
									const res = await todaysWaterConsumed(currentGlasses);

									if (res.success && res.data) {
										const { glasses, ounces, litres } = res.data;

										setWaterConsumed({
											glasses,
											ounces,
											litres
										});

										setCurrentGlasses(0);
									}
								});
							}}>
							{isFetchingWater ? <ImSpinner2 /> : <FaGlassWater />}
							Log
						</Button>
					</div>
				)}

				{weight && (
					<div className='text-muted-foreground text-sm'>
						<p>
							The water amounts are the minimum water reqiurements you need a
							day, based on your weight of{' '}
							<span className='font-bold'>{weight.weightInPounds} pounds</span>{' '}
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
	);
}

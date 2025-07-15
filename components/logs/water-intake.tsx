'use client';

import { getUserBMR } from '@/actions/bmr-actions';
import { todaysWaterConsumed } from '@/actions/log-actions';
import { calculateWaterIntake, colateBMRData, formatUnit } from '@/lib/utils';
import { BMRData } from '@/types';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { FaGlassWater } from 'react-icons/fa6';
import { ImSpinner2 } from 'react-icons/im';
import { IoIosWater } from 'react-icons/io';
import IncrementButton from '../increment-button';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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
						<div className='absolute w-auto h-4 rounded-full bg-red-700 text-xs top-0 right-0 p-1 flex items-center justify-center'>
							{waterConsumed?.glasses ?? 0}
						</div>
					)}
				</div>
			</PopoverTrigger>
			<PopoverContent className='flex flex-col gap-4 items-center justify-center max-h-[70vh]'>
				<div className='flex flex-row items-center gap-2'>
					<IoIosWater className='w-10 h-10 text-blue-600' />
					Daily Water Requirements
				</div>
				<div className='text-blue-600 flex flex-col items-center justify-center w-full'>
					{isFetching ? (
						<div className='h-10'>
							<ImSpinner2 className='animate-spin' />
						</div>
					) : (
						waterData && (
							<div className='flex flex-row flex-wrap gap-2 items-center justify-center w-full'>
								<Badge className='flex flex-col !gap-0 items-center bg-blue-800'>
									{waterData.glasses} <span className='text-sm'>glasses</span>
								</Badge>
								<Badge className='flex flex-col !gap-0 items-center bg-blue-800'>
									{waterData.ounces} <span className='text-sm'>ounces</span>
								</Badge>
								<Badge className='flex flex-col !gap-0 items-center bg-blue-800'>
									{waterData.litres} <span className='text-sm'>litres</span>
								</Badge>
							</div>
						)
					)}
				</div>

				{waterConsumed && waterData && (
					<div className='flex flex-col gap-4 w-full items-center justify-center'>
						<div className='flex flex-col items-center justify-center gap-0'>
							<div className='text-blue-600 text-6xl font-extrabold flex flex-row gap-1 items-center justify-center'>
								<FaGlassWater className='w-10 h-10' />
								{waterConsumed.glasses}

								{waterConsumed.glasses < waterData.glasses ? (
									<ArrowDown className='animate-bounce text-red-600' />
								) : (
									<ArrowUp className='animate-bounce text-green-600' />
								)}
							</div>
							<div>Glasses today</div>
						</div>

						<div className='flex flex-col gap-0 items-center justify-center w-full'>
							<div className='text-sm text-muted-foreground'>
								{currentGlasses}
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
						</div>

						<Button
							disabled={isFetchingWater}
							onClick={() => {
								setIsFetchingWater(async () => {
									const res = await todaysWaterConsumed(currentGlasses);

									if (res.success && res.data) {
										const { glasses, ounces, litres } = res.data;

										//setWaterData(res.data);
										setWaterConsumed({
											glasses,
											ounces,
											litres
										});
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
							The water amounts are based on your weight of{' '}
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

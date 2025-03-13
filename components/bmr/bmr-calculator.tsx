'use client';

import { useEffect, useState } from 'react';
import NumberIncrementor from '../number-incrementor';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import { calculateBMR } from '@/lib/utils';
import { BMRData } from '@/types';

export default function BMRCalculatorForm() {
	const [feet, setFeet] = useState(0);
	const [inches, setInches] = useState(0);
	const [weight, setWeight] = useState(0);
	const [age, setAge] = useState(0);
	const [actualHeight, setActualHeight] = useState(0);
	const [actualWeight, setActualWeight] = useState(0);
	const [weightUnit, setWeightUnit] = useState('pounds');
	const [bmr, setBmr] = useState(0);

	useEffect(() => {
		const feetInchesToCm = feet * 12 * 2.54;
		const inchesToCm = inches * 2.54;
		const cm = feetInchesToCm + inchesToCm;

		setActualHeight(cm);
		setBMRData();
	}, [feet, inches]);

	useEffect(() => {
		setActualWeight(weightUnit === 'pounds' ? weight * 0.4535924 : weight);
		setBMRData();
	}, [weight]);

	useEffect(() => {
		setBMRData();
	}, [actualHeight, actualWeight, age]);

	useEffect(() => {
		setActualWeight(weightUnit === 'pounds' ? weight * 0.4535924 : weight);
		setBMRData();
	}, [weightUnit]);

	const setBMRData = () => {
		if (actualHeight && actualWeight && age) {
			const data: BMRData = {
				age,
				height: actualHeight,
				heightUnit: 'cm',
				sex: 'male',
				weight: actualWeight,
				weightUnit: 'kilo'
			};

			const result = calculateBMR(data);

			setBmr(result);
		}
	};

	return (
		<div className='flex flex-col gap-2'>
			<div className='text-lg font-semibold'></div>
			<Card>
				<CardHeader>BMR Calculator</CardHeader>
				<CardContent className='flex flex-col gap-2'>
					<div className='font-semibold'>Height</div>
					<div className='flex flex-row flex-wrap justify-between gap-2'>
						<div>
							<div className='text-xs'>Feet</div>
							<NumberIncrementor
								allowDecimalIncrement={false}
								minValue={1}
								value={1}
								onChange={(value) => {
									setFeet(value);
								}}
							/>
						</div>

						<div>
							<div className='text-xs'>inches</div>
							<NumberIncrementor
								allowDecimalIncrement={false}
								minValue={0}
								maxValue={11}
								value={0}
								onChange={(value) => {
									setInches(value);
								}}
							/>
						</div>
					</div>
					<br />

					<div className='flex flex-row flex-wrap justify-between gap-2'>
						<div className='flex flex-col gap-2'>
							<div className='font-semibold flex flex-row items-center gap-2'>
								Weight
							</div>

							<div className='flex flex-row flex-wrap justify-between gap-2'>
								<div>
									<div className='text-xs flex flex-row items-center gap-2'>
										<Input
											className='w-24'
											type='number'
											onChange={(e) => {
												setWeight(Number(e.target.value));
											}}
										/>
										<ToggleGroup
											className='w-fit text-xs'
											type='single'
											defaultValue='pounds'
											onValueChange={setWeightUnit}>
											<ToggleGroupItem
												value='pounds'
												className='text-xs'>
												lbs
											</ToggleGroupItem>
											<ToggleGroupItem
												value='kilo'
												className='text-xs'>
												kg
											</ToggleGroupItem>
										</ToggleGroup>
									</div>
								</div>
							</div>
						</div>

						<div className='flex flex-col gap-2'>
							<div className='font-semibold'>Age</div>
							<div className='flex flex-row flex-wrap justify-between gap-2'>
								<div>
									<Input
										className='w-24'
										type='number'
										onChange={(e) => {
											setAge(Number(e.target.value));
										}}
									/>
								</div>
							</div>
						</div>
					</div>
				</CardContent>
				<CardFooter>{bmr > 0 && bmr}</CardFooter>
			</Card>
		</div>
	);
}

'use client';

import { useEffect, useState } from 'react';
import NumberIncrementor from '../number-incrementor';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Input } from '../ui/input';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import {
	calculateBMR,
	colateBMRData,
	formatUnit,
	INCH_TO_CM,
	POUND_TO_KILO
} from '@/lib/utils';
import { BMRData, GetUser } from '@/types';
import { useSession } from 'next-auth/react';
import { Button } from '../ui/button';
import { addUserBMR, getBMRById, updateUserBMR } from '@/actions/bmr-actions';
import { toast } from 'sonner';
import BMRCalculatorSkeleton from '../skeletons/bmr-calculator-skeleton';
import { Avatar, AvatarImage } from '../ui/avatar';
import { AvatarFallback } from '@radix-ui/react-avatar';
import {
	Calculator,
	NotebookPenIcon,
	Ruler,
	Users,
	Weight
} from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';

export default function BMRCalculatorForm() {
	const [feet, setFeet] = useState(1);
	const [inches, setInches] = useState(0);
	const [weight, setWeight] = useState(0);
	const [age, setAge] = useState(0);
	const [actualHeight, setActualHeight] = useState(0);
	const [actualWeight, setActualWeight] = useState(0);
	const [weightUnit, setWeightUnit] = useState('pounds');
	const [bmrData, setBmrData] = useState<BMRData>();
	const [sex, setSex] = useState('male');
	const [bmr, setBmr] = useState(0);
	const [submitting, setSubmitting] = useState(false);
	const [hasUserData, setHasUserData] = useState(false);
	const [userHasSavedBMR, setUserHasSavedBMR] = useState(false);

	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const getUserBMR = async () => {
		const res = await getBMRById(user.id);

		if (res.success && res.data) {
			setUserHasSavedBMR(true);
			const {
				age,
				weight,
				weightUnit,
				height,
				heightUnit,
				sex: retSex,
				bmr: retBmr
			} = res.data;

			const data: BMRData = {
				age,
				height,
				heightUnit: heightUnit as 'inch' | 'cm',
				sex: retSex as 'male' | 'female',
				weight,
				weightUnit: weightUnit as 'pound' | 'kilo'
			};

			const {
				weightInPounds,
				heightInInches,
				heightInFeet,
				age: retAge,
				sex: cSex
			} = colateBMRData(data);

			setInches(heightInInches);
			setFeet(heightInFeet);
			setAge(retAge);
			setSex(cSex);
			setWeight(weightInPounds);
			setBmr(retBmr);
		}

		setHasUserData(true);
	};

	useEffect(() => {
		if (user && user.id) {
			getUserBMR();
		} else {
			setHasUserData(true);
			setUserHasSavedBMR(false);
		}
	}, [user]);

	useEffect(() => {
		const feetInchesToCm = feet * 12 * INCH_TO_CM;
		const inchesToCm = inches * INCH_TO_CM;
		const cm = feetInchesToCm + inchesToCm;

		setActualHeight(cm);
		setBMRData();
	}, [feet, inches]);

	useEffect(() => {
		setActualWeight(weightUnit === 'pounds' ? weight * POUND_TO_KILO : weight);
		setBMRData();
	}, [weight]);

	useEffect(() => {
		setBMRData();
	}, [actualHeight, actualWeight, age]);

	useEffect(() => {
		setActualWeight(weightUnit === 'pounds' ? weight * POUND_TO_KILO : weight);
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

			setBmrData(data);

			setBmr(result);
		}
	};

	const handleSaveBMR = async () => {
		const res = !userHasSavedBMR
			? await addUserBMR(user.id, bmrData as BMRData)
			: await updateUserBMR(user.id, bmrData as BMRData);

		if (res.success) {
			toast.success(res.message);
		} else {
			toast.error(res.message);
		}

		setSubmitting(false);
	};

	return (
		<div className='flex flex-col items-center gap-2'>
			{hasUserData ? (
				<Card className='lg:w-[50vw]'>
					<CardHeader className='flex flex-row items-center gap-2 font-semibold'>
						<Calculator className='w-5 h-5' />
						BMR Calculator
					</CardHeader>
					<CardContent className='flex flex-col gap-2'>
						<div>
							<div className='flex flex-row items-center justify-center gap-2 rounded-md border-2 p-1'>
								<div className='text-muted-foreground'>You are a</div>
								<ToggleGroup
									type='single'
									defaultValue={sex}>
									<ToggleGroupItem value='male'>Man</ToggleGroupItem>
									<ToggleGroupItem value='female'>Woman</ToggleGroupItem>
								</ToggleGroup>
							</div>
						</div>

						<div className='font-semibold flex flex-row items-center gap-1'>
							<Ruler className='w-4 h-4' />
							Height
						</div>
						<div className='flex flex-row portrait:flex-col portait:justify-center flex-wrap justify-between gap-2 items-center'>
							<div className='flex flex-col portrait:flex-row-reverse portrait:justify-end gap-2 items-center'>
								<NumberIncrementor
									allowDecimalIncrement={false}
									minValue={1}
									value={feet}
									onChange={(value) => {
										setFeet(value);
									}}>
									<div className='text-xs text-muted-foreground'>Feet</div>
								</NumberIncrementor>
							</div>

							<div className='flex flex-col portrait:flex-row-reverse portrait:justify-end gap-2 items-center'>
								<NumberIncrementor
									allowDecimalIncrement={false}
									minValue={0}
									maxValue={11}
									value={inches}
									onChange={(value) => {
										setInches(value);
									}}>
									<div className='text-xs text-muted-foreground'>inches</div>
								</NumberIncrementor>
							</div>
						</div>
						<br />

						<div className='flex flex-row flex-wrap justify-between gap-2'>
							<div className='flex flex-col gap-2'>
								<div className='font-semibold flex flex-row items-center gap-1'>
									<Weight className='w-4 h-4' />
									Weight
								</div>

								<div className='flex flex-row flex-wrap justify-between gap-2'>
									<div>
										<div className='text-xs flex flex-row items-center gap-2'>
											<Input
												className='w-24'
												type='number'
												defaultValue={weight > 0 ? weight : ''}
												min={1}
												onChange={(e) => {
													setWeight(Number(e.target.value));
												}}
											/>
											<ToggleGroup
												className='w-fit text-xs'
												type='single'
												defaultValue={weightUnit}
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
								<div className='font-semibold flex flex-row items-center gap-1'>
									<Users className='w-4 h-4' />
									Age
								</div>
								<div className='flex flex-row flex-wrap justify-between gap-2'>
									<div>
										<Input
											className='w-24'
											type='number'
											min={1}
											defaultValue={age > 0 ? age : ''}
											onChange={(e) => {
												setAge(Number(e.target.value));
											}}
										/>
									</div>
								</div>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						{bmr > 0 && (
							<div className='flex portrait:flex-col flex-row items-center justify-between gap-4 w-full rounded-md p-2 border-2'>
								{user && (
									<Avatar>
										<AvatarImage
											src={user.image}
											alt={user.name}
										/>
										<AvatarFallback className='capitalize'>
											{user.name.slice(0, 1)}
										</AvatarFallback>
									</Avatar>
								)}

								<div className='text-sm'>
									Your BMR is{' '}
									<span className='font-bold text-lg'>{formatUnit(bmr)}</span>{' '}
									calories a day
								</div>

								{user?.id && (
									<div>
										<Button
											className='w-28'
											disabled={submitting}
											onClick={() => {
												setSubmitting(true);
												handleSaveBMR();
											}}>
											{submitting ? (
												<FaSpinner className='w-4 h-4 animate-spin' />
											) : (
												<NotebookPenIcon className='w-4 h-4' />
											)}
											{submitting
												? userHasSavedBMR
													? 'Updating...'
													: 'Saving...'
												: userHasSavedBMR
												? 'Update'
												: 'Save'}
										</Button>
									</div>
								)}
							</div>
						)}
					</CardFooter>
				</Card>
			) : (
				<BMRCalculatorSkeleton />
			)}
		</div>
	);
}

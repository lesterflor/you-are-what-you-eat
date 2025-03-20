'use client';

import { FoodEntry, GetFoodItem } from '@/types';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader
} from '../ui/card';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import { Badge } from '../ui/badge';
import { useSession } from 'next-auth/react';
import { Button } from '../ui/button';
import NumberIncrementor from '../number-incrementor';
import { useContext, useState } from 'react';
import { createDailyLog, updateLog } from '@/actions/log-actions';
import { toast } from 'sonner';
import { FilePlus } from 'lucide-react';
import { LogUpdateContext } from '@/contexts/log-context';
import { formatUnit, getMacroPercOfCals } from '@/lib/utils';
import { FaSpinner } from 'react-icons/fa';
import FoodUserAvatar from './food-user-avatar';

export default function FoodItemCard({ item }: { item: GetFoodItem }) {
	const { data: session } = useSession();
	const logContext = useContext(LogUpdateContext);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [logFoodItem, setLogFoodItem] = useState<FoodEntry>({
		id: item.id,
		name: item.name,
		category: item.category,
		description: item.description ?? '',
		numServings: 1,
		image: item.image || '',
		carbGrams: item.carbGrams,
		fatGrams: item.fatGrams,
		proteinGrams: item.proteinGrams,
		calories: item.calories,
		eatenAt: new Date()
	});

	const [portionAmount, setPortionAmount] = useState(1);

	const sendFoodItems = async () => {
		setIsSubmitting(true);
		const getLatestLog = await createDailyLog();

		const currentFoodItems = getLatestLog?.data?.foodItems || [];

		const cleanArr = currentFoodItems.map((item) => ({
			...item,
			description: item.description || '',
			image: item.image || ''
		}));

		const foodItems = [...cleanArr];
		foodItems.push(logFoodItem);
		const res = await updateLog(foodItems);

		if (res.success) {
			toast('Added to your daily log!');

			if (logContext && logContext.isUpdated) {
				const update = {
					...logContext,
					updated: true
				};
				logContext.isUpdated(update);
			}
		} else {
			toast.error('Oops, Something went wrong with adding the item.');
		}

		setIsSubmitting(false);
	};

	return (
		<Card className='relative select-none'>
			<CardHeader className='text-2xl font-semibold capitalize pb-2 pr-4'>
				<div className='flex flex-row items-center justify-start gap-2 pr-8'>
					<FoodCategoryIconMapper type={item.category} />
					{item.name}
				</div>
			</CardHeader>
			<CardDescription className='px-6 pb-4'>
				{item.description}
			</CardDescription>
			<CardContent className='flex flex-row flex-wrap gap-2 px-4'>
				{session && item.user && (
					<div className='absolute top-2 right-2'>
						<FoodUserAvatar
							user={item.user}
							foodItemId={item.id}
						/>
					</div>
				)}

				<div className='flex flex-row items-center gap-2'>
					<Badge
						variant='secondary'
						className='w-24 flex flex-col items-center justify-center'>
						<div>
							<span className='font-normal'>Prot:</span>{' '}
							{formatUnit(item.proteinGrams * portionAmount)} g
						</div>
						<div className='text-muted-foreground text-xs font-normal'>
							{getMacroPercOfCals(item.proteinGrams, item.calories, 'protein')}
						</div>
					</Badge>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<Badge
						variant='secondary'
						className='w-24 flex flex-col items-center justify-center'>
						<div>
							<span className='font-normal'>Carb:</span>{' '}
							{formatUnit(item.carbGrams * portionAmount)} g
						</div>

						<div className='text-muted-foreground text-xs font-normal'>
							{getMacroPercOfCals(item.carbGrams, item.calories, 'carb')}
						</div>
					</Badge>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<Badge
						variant='secondary'
						className='w-24 flex flex-col items-center justify-center'>
						<div>
							<span className='font-normal'>Fat:</span>{' '}
							{formatUnit(item.fatGrams * portionAmount)} g
						</div>
						<div className='text-muted-foreground text-xs font-normal'>
							{getMacroPercOfCals(item.fatGrams, item.calories, 'fat')}
						</div>
					</Badge>
				</div>
				<div className='flex flex-row items-center gap-2'>
					<Badge
						variant='secondary'
						className='w-24 flex flex-row items-center justify-center'>
						Serving: {item.servingSize * portionAmount}
					</Badge>
				</div>

				<div className='flex flex-row items-center gap-2'>
					<Badge className='w-28 flex flex-row items-center justify-center'>
						Calories {formatUnit(item.calories * portionAmount)}
					</Badge>
				</div>
			</CardContent>

			<CardFooter className='flex flex-row items-center justify-end'>
				{session && (
					<div className='flex flex-row items-end justify-center gap-2 flex-wrap'>
						<div className='flex flex-col items-center'>
							<span className='text-sm'>Servings</span>
							<NumberIncrementor
								onChange={(val) => {
									setPortionAmount(val);

									const entry: FoodEntry = {
										id: item.id,
										name: item.name,
										category: item.category,
										description: item.description ?? '',
										numServings: val,
										image: (item.image as string) ?? '',
										carbGrams: item.carbGrams,
										fatGrams: item.fatGrams,
										proteinGrams: item.proteinGrams,
										calories: item.calories,
										eatenAt: new Date()
									};

									setLogFoodItem(entry);
								}}
								minValue={0.1}
								value={1}
							/>
						</div>

						<Button
							disabled={isSubmitting}
							onClick={(e) => {
								e.preventDefault();
								sendFoodItems();
							}}>
							{isSubmitting ? (
								<FaSpinner className='w-4 h-4 animate-spin' />
							) : (
								<FilePlus className='w-4 h-4' />
							)}
							{isSubmitting ? '...Adding' : 'Add to log'}
						</Button>
					</div>
				)}
			</CardFooter>
		</Card>
	);
}

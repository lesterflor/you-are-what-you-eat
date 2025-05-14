'use client';

import { createDailyLog, updateLog } from '@/actions/log-actions';
import { setCheckedItemState } from '@/lib/features/dish/preparedDishSlice';
import { added } from '@/lib/features/log/logFoodSlice';
import { useAppDispatch } from '@/lib/hooks';
import { cn, formatUnit, getMacroPercOfCals } from '@/lib/utils';
import { FoodEntry, GetFoodItem } from '@/types';
import { FilePlus, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { GiSpoon } from 'react-icons/gi';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import NumberIncrementor from '../number-incrementor';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader
} from '../ui/card';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import FoodItemFavourite from './food-item-favourite';
import FoodUserAvatar from './food-user-avatar';

export default function FoodItemCard({
	item,
	selfSearch = false,
	indx = 0
}: {
	item: GetFoodItem;
	selfSearch?: boolean;
	indx?: number;
}) {
	const dispatch = useAppDispatch();
	const cardRef = useRef<HTMLDivElement>(null);

	const { data: session } = useSession();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [textSize, setTextSize] = useState('text-xl');

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
			toast.success('Added to your daily log!');

			// redux
			dispatch(
				added({
					name: logFoodItem.name,
					servings: logFoodItem.numServings
				})
			);

			setShowDetails(false);
		} else {
			toast.error('Oops, Something went wrong with adding the item.');
		}

		setIsSubmitting(false);
	};

	const [fadeClass, setFadeClass] = useState(false);
	useEffect(() => {
		if (item.name.length >= 20) {
			setTextSize('text-md');
		}

		setTimeout(
			() => {
				setFadeClass(true);
			},
			indx === 0 ? 1 : indx * 20
		);
	}, []);

	useEffect(() => {
		if (showDetails && cardRef.current) {
			cardRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});
		}
	}, [showDetails]);

	const [sendingDishItem, setSendingDishItem] = useState(false);

	return (
		<Card
			className='p-0 w-full relative select-none transition-opacity opacity-0 duration-1000'
			style={{
				opacity: fadeClass ? 1 : 0
			}}>
			<CardHeader
				className={cn(
					'font-semibold capitalize pt-2 pl-2 pb-2 pr-4',
					showDetails ? 'text-foreground' : 'text-muted-foreground',
					textSize
				)}>
				<div
					onClick={(e) => {
						e.preventDefault();
						setShowDetails(!showDetails);
					}}
					className='flex flex-row items-start justify-start gap-2 pr-8 leading-tight'>
					<FoodCategoryIconMapper type={item.category} />
					{item.name}
				</div>

				<div className='flex flex-row items-center justify-center gap-2 absolute top-1 right-1'>
					{session && item.user && (
						<div>
							<FoodUserAvatar
								selfSearch={selfSearch}
								user={item.user}
								foodItemId={item.id}
							/>
						</div>
					)}
				</div>
			</CardHeader>

			{showDetails && (
				<>
					<CardDescription className='px-4 pr-1 pb-4 leading-tight flex flex-row items-center justify-between gap-2'>
						<div>{item.description}</div>
						<FoodItemFavourite item={item} />
					</CardDescription>
					<CardContent
						className='flex flex-row items-center justify-center flex-wrap gap-2 p-0'
						ref={cardRef}>
						<div className='flex flex-row items-center gap-2 portrait:gap-1'>
							<Badge
								variant='secondary'
								className='w-14 flex flex-col items-center justify-center'>
								<div className='font-normal text-muted-foreground'>Protein</div>
								<div className='whitespace-nowrap'>
									{formatUnit(item.proteinGrams * portionAmount)} g
								</div>
								<div className='text-muted-foreground text-xs font-normal'>
									{getMacroPercOfCals(
										item.proteinGrams,
										item.calories,
										'protein'
									)}
								</div>
							</Badge>
						</div>
						<div className='flex flex-row items-center gap-2'>
							<Badge
								variant='secondary'
								className='w-14 flex flex-col items-center justify-center'>
								<div className='font-normal text-muted-foreground'>Carb</div>
								<div className='whitespace-nowrap'>
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
								className='w-14 flex flex-col items-center justify-center'>
								<div className='font-normal text-muted-foreground'>Fat</div>
								<div className='whitespace-nowrap'>
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
								className='w-14 flex flex-col items-center justify-center'>
								<div className='font-normal text-muted-foreground'>
									{item.servingSize * portionAmount === 1
										? 'Serving'
										: 'Servings'}
								</div>
								<div>{item.servingSize * portionAmount}</div>
								<div>
									<GiSpoon className='w-4 h-4 text-muted-foreground' />
								</div>
							</Badge>
						</div>

						<div className='flex flex-row items-center gap-2'>
							<Badge className='flex flex-col items-center justify-center'>
								<div className='font-normal'>Calories</div>
								<div>{formatUnit(item.calories * portionAmount)}</div>
							</Badge>
						</div>
					</CardContent>

					<CardFooter className='flex flex-row items-center justify-center px-2'>
						{session && (
							<div className='flex flex-col items-center justify-center gap-2 w-full'>
								<div className='flex flex-col items-center'>
									<NumberIncrementor
										allowLongPress={false}
										compactMode={false}
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
										value={1}>
										<span className='text-xs'>Servings</span>
									</NumberIncrementor>
								</div>

								<div className='flex flex-row items-center justify-between w-full'>
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

									<Button
										disabled={sendingDishItem}
										variant={'secondary'}
										onClick={() => {
											setSendingDishItem(true);
											const clone = { ...logFoodItem };
											clone.eatenAt = new Date();

											dispatch(
												setCheckedItemState({
													id: '',
													name: '',
													description: '',
													dishList: '',
													checkedItem: JSON.stringify({
														add: true,
														item: clone
													})
												})
											);

											setTimeout(() => {
												setSendingDishItem(false);
												toast.success(
													`Added ${clone.numServings} ${
														clone.numServings === 1 ? 'serving' : 'servings'
													} of ${clone.name} to the dish list`
												);
											}, 1000);
										}}>
										{sendingDishItem ? (
											<ImSpinner2 className='animate-spin' />
										) : (
											<Plus />
										)}
										Add to Dish List
									</Button>
								</div>
							</div>
						)}
					</CardFooter>
				</>
			)}
		</Card>
	);
}

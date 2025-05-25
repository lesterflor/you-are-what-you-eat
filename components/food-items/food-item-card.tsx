'use client';

import { getFoodItemById } from '@/actions/food-actions';
import { createDailyLog, updateLog } from '@/actions/log-actions';
import { setCheckedItemState } from '@/lib/features/dish/preparedDishSlice';
import {
	selectFoodUpdateData,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import { added } from '@/lib/features/log/logFoodSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { selectImageData, selectImageStatus } from '@/lib/image/imageSlice';
import { cn, formatUnit, getMacroPercOfCals } from '@/lib/utils';
import { FoodEntry, GetFoodItem, GetUser } from '@/types';
import { Aperture, FilePlus, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { GiSpoon } from 'react-icons/gi';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import TakePhoto from '../image/take-photo';
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
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import FoodItemFavourite from './food-item-favourite';
import FoodItemImageGallery from './food-item-image-gallery';
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

	const [currentItem, setCurrentItem] = useState<GetFoodItem>(item);
	const [isFetching, setIsFetching] = useState(false);

	const fetchFoodItemData = async (id: string) => {
		setIsFetching(true);

		const res = await getFoodItemById(id);

		if (res.success && res.data) {
			setCurrentItem(res.data as GetFoodItem);
		}

		setIsFetching(false);
	};

	const { data: session } = useSession();
	const currentUser = session?.user as GetUser;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [textSize, setTextSize] = useState('text-xl');
	const [photoDlgOpen, setPhotoDlgOpen] = useState(false);

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

	const imageData = useAppSelector(selectImageData);
	const imageStatus = useAppSelector(selectImageStatus);

	useEffect(() => {
		if (
			imageStatus === 'added' &&
			imageData.type === 'foodItem' &&
			imageData.id === item.id
		) {
			fetchFoodItemData(item.id);
		}
	}, [imageData, imageStatus]);

	const foodUpdateData = useAppSelector(selectFoodUpdateData);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

	useEffect(() => {
		if (foodUpdateStatus === 'updated' && foodUpdateData.id === item.id) {
			fetchFoodItemData(item.id);
		}
	}, [foodUpdateData, foodUpdateStatus]);

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
					{isFetching ? (
						<ImSpinner2 className='animate-spin w-6 h-6 opacity-25' />
					) : (
						<FoodCategoryIconMapper type={currentItem.category} />
					)}

					{currentItem.name}
				</div>

				<div className='flex flex-row items-center justify-center gap-2 absolute top-1 right-1'>
					{session && currentItem.user && (
						<div>
							<FoodUserAvatar
								selfSearch={selfSearch}
								user={currentItem.user}
								foodItemId={currentItem.id}
								foodItem={currentItem}
							/>
						</div>
					)}
				</div>
			</CardHeader>

			{showDetails && (
				<>
					<CardDescription className='px-4 pr-1 pb-4 leading-tight flex flex-row items-center justify-between gap-2'>
						<div>{currentItem.description}</div>
						<FoodItemFavourite item={currentItem} />
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
									{formatUnit(currentItem.proteinGrams * portionAmount)} g
								</div>
								<div className='text-muted-foreground text-xs font-normal'>
									{getMacroPercOfCals(
										currentItem.proteinGrams,
										currentItem.calories,
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
									{formatUnit(currentItem.carbGrams * portionAmount)} g
								</div>

								<div className='text-muted-foreground text-xs font-normal'>
									{getMacroPercOfCals(
										currentItem.carbGrams,
										currentItem.calories,
										'carb'
									)}
								</div>
							</Badge>
						</div>
						<div className='flex flex-row items-center gap-2'>
							<Badge
								variant='secondary'
								className='w-14 flex flex-col items-center justify-center'>
								<div className='font-normal text-muted-foreground'>Fat</div>
								<div className='whitespace-nowrap'>
									{formatUnit(currentItem.fatGrams * portionAmount)} g
								</div>
								<div className='text-muted-foreground text-xs font-normal'>
									{getMacroPercOfCals(
										currentItem.fatGrams,
										currentItem.calories,
										'fat'
									)}
								</div>
							</Badge>
						</div>
						<div className='flex flex-row items-center gap-2'>
							<Badge
								variant='secondary'
								className='w-14 flex flex-col items-center justify-center'>
								<div className='font-normal text-muted-foreground'>
									{currentItem.servingSize * portionAmount === 1
										? 'Serving'
										: 'Servings'}
								</div>
								<div>{currentItem.servingSize * portionAmount}</div>
								<div>
									<GiSpoon className='w-4 h-4 text-muted-foreground' />
								</div>
							</Badge>
						</div>

						<div className='flex flex-row items-center gap-2'>
							<Badge className='flex flex-col items-center justify-center'>
								<div className='font-normal'>Calories</div>
								<div>{formatUnit(currentItem.calories * portionAmount)}</div>
							</Badge>
						</div>
					</CardContent>

					<CardFooter className='flex flex-row items-center justify-center px-2'>
						{session && (
							<div className='flex flex-col items-center justify-center gap-2 w-full'>
								<div className='flex flex-col items-center pb-4'>
									<NumberIncrementor
										allowLongPress={false}
										compactMode={false}
										onChange={(val) => {
											setPortionAmount(val);

											const entry: FoodEntry = {
												id: currentItem.id,
												name: currentItem.name,
												category: currentItem.category,
												description: currentItem.description ?? '',
												numServings: val,
												image: (currentItem.image as string) ?? '',
												carbGrams: currentItem.carbGrams,
												fatGrams: currentItem.fatGrams,
												proteinGrams: currentItem.proteinGrams,
												calories: currentItem.calories,
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
										className='px-2'
										disabled={isSubmitting}
										onClick={(e) => {
											e.preventDefault();
											sendFoodItems();
										}}>
										{isSubmitting ? (
											<ImSpinner2 className='w-4 h-4 animate-spin' />
										) : (
											<FilePlus className='w-4 h-4' />
										)}
										{isSubmitting ? '...Adding' : 'Add to log'}
									</Button>

									<Button
										className='px-2'
										disabled={sendingDishItem}
										variant={'secondary'}
										onClick={() => {
											setSendingDishItem(true);
											const clone = { ...logFoodItem };
											clone.eatenAt = new Date();

											//console.log(`dish item: ${JSON.stringify(clone)}`);

											dispatch(
												setCheckedItemState({
													id: '',
													name: '',
													description: '',
													dishList: '[]',
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

									{item.userId === currentUser.id && (
										<Dialog
											open={photoDlgOpen}
											onOpenChange={setPhotoDlgOpen}>
											<DialogTrigger asChild>
												<Button
													size={'icon'}
													variant={'secondary'}>
													<Aperture />
												</Button>
											</DialogTrigger>
											<DialogContent className='max-w-[100vw] max-h-[80vh] overflow-y-auto h-[80vh]'>
												<DialogTitle>
													<Aperture className='w-6 h-6 text-muted-foreground' />
												</DialogTitle>
												<TakePhoto<GetFoodItem>
													data={currentItem}
													type='foodItem'
													onSuccess={() => {
														setPhotoDlgOpen(false);
													}}
												/>
											</DialogContent>
										</Dialog>
									)}
								</div>

								{/* gallery here */}
								{currentItem.foodItemImages &&
									currentItem.foodItemImages?.length > 0 && (
										<div className='pt-4 w-full'>
											<FoodItemImageGallery item={currentItem} />
										</div>
									)}
							</div>
						)}
					</CardFooter>
				</>
			)}
		</Card>
	);
}

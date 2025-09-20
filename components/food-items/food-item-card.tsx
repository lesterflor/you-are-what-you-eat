'use client';

import { setCheckedItemState } from '@/lib/features/dish/preparedDishSlice';
import {
	selectFoodUpdateData,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import { added } from '@/lib/features/log/logFoodSlice';
import { addLogFoodItemMutationOptions } from '@/lib/features/mutations/logMutations';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
	addImageState,
	selectImageData,
	selectImageStatus
} from '@/lib/image/imageSlice';
import { getFoodItemByIdQueryOptions } from '@/lib/queries/foodQueries';
import {
	getCurrentLogQueryOptions,
	getLogRemainderQueryOptions
} from '@/lib/queries/logQueries';
import { cn, formatUnit, getMacroPercOfCals, isNewFoodItem } from '@/lib/utils';
import { FoodEntry, GetFoodItem, GetFoodItemImage, GetUser } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Aperture, FilePlus, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { memo, useEffect, useRef, useState } from 'react';
import { FaAsterisk } from 'react-icons/fa';
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
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import FoodItemFavourite from './food-item-favourite';
import FoodItemImageGallery from './food-item-image-gallery';
import FoodUserAvatar from './food-user-avatar';

const FoodItemCard = memo(function FoodItemCard({
	item,
	selfSearch = false,
	indx = 0
}: {
	item: GetFoodItem;
	selfSearch?: boolean;
	indx?: number;
}) {
	const { data: session } = useSession();
	const currentUser = session?.user as GetUser;
	const cardRef = useRef<HTMLDivElement>(null);

	const dispatch = useAppDispatch();
	const imageData = useAppSelector(selectImageData);
	const imageStatus = useAppSelector(selectImageStatus);
	const foodUpdateData = useAppSelector(selectFoodUpdateData);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

	const [fadeClass, setFadeClass] = useState(false);
	const [queryEnabled, setQueryEnabled] = useState(false);
	const [showDetails, setShowDetails] = useState(false);
	const [textSize, setTextSize] = useState('text-xl');
	const [photoDlgOpen, setPhotoDlgOpen] = useState(false);
	const [sendingDishItem, setSendingDishItem] = useState(false);
	const [logFoodItem, setLogFoodItem] = useState<FoodEntry>({
		id: `${item.id}-${new Date().getTime()}`,
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

	const query = useQueryClient();

	const { data: currentItem = item, isFetching } = useQuery(
		getFoodItemByIdQueryOptions(item.id, queryEnabled)
	);

	const { mutate: logFoodMtn, isPending: isSubmitting } = useMutation(
		addLogFoodItemMutationOptions(logFoodItem)
	);

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

	useEffect(() => {
		if (
			imageStatus === 'added' &&
			imageData.type === 'foodItem' &&
			imageData.id === item.id
		) {
			setQueryEnabled(true);
		}
	}, [imageData, imageStatus]);

	useEffect(() => {
		if (foodUpdateStatus === 'updated' && foodUpdateData.id === item.id) {
			setQueryEnabled(true);
		}
	}, [foodUpdateData, foodUpdateStatus]);

	const sendFoodItems = () => {
		logFoodMtn(logFoodItem, {
			onSuccess: () => {
				setShowDetails(false);

				// tanstack
				query.invalidateQueries({
					queryKey: getCurrentLogQueryOptions().queryKey
				});

				// invalidate remainders
				query.invalidateQueries({
					queryKey: getLogRemainderQueryOptions().queryKey
				});

				// redux
				dispatch(
					added({
						name: logFoodItem.name,
						servings: logFoodItem.numServings
					})
				);
			}
		});
	};

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
				{isNewFoodItem(currentItem.createdAt) && (
					<Popover>
						<PopoverTrigger
							asChild
							className='absolute top-0 left-0'>
							<FaAsterisk className='w-3 h-3 text-green-500 animate-pulse' />
						</PopoverTrigger>
						<PopoverContent className='text-xs'>
							Added by{' '}
							<span className='font-semibold'>
								{currentItem.user?.name || 'a user'}
							</span>{' '}
							on {format(new Date(currentItem.createdAt), 'MMM do')}
						</PopoverContent>
					</Popover>
				)}

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
								foodItem={currentItem as GetFoodItem}
							/>
						</div>
					)}
				</div>
			</CardHeader>

			{showDetails && (
				<>
					<CardDescription className='px-4 pr-1 pb-4 leading-tight flex flex-row items-center justify-between gap-2'>
						<div>{currentItem.description}</div>
						<FoodItemFavourite item={currentItem as GetFoodItem} />
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
									{currentItem.servingSize &&
									currentItem.servingSize * portionAmount === 1
										? 'Serving'
										: 'Servings'}
								</div>
								<div>
									{currentItem.servingSize &&
										currentItem.servingSize * portionAmount}
								</div>
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
												id: `${currentItem.id}-${new Date().getTime()}`,
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
												<TakePhoto<GetFoodItem, GetFoodItemImage>
													data={currentItem as GetFoodItem}
													type='foodItem'
													onSaveSuccess={(data) => {
														setPhotoDlgOpen(false);

														const { foodItemId, url, alt } =
															data as GetFoodItemImage;

														dispatch(
															addImageState({
																id: foodItemId,
																url,
																alt,
																type: 'foodItem'
															})
														);
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
											<FoodItemImageGallery item={currentItem as GetFoodItem} />
										</div>
									)}
							</div>
						)}
					</CardFooter>
				</>
			)}
		</Card>
	);
});

export default FoodItemCard;

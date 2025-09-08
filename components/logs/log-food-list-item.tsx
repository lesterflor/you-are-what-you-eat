'use client';

import { getFoodItemById } from '@/actions/food-actions';
import { deleteFoodLogEntry, updateFoodLogEntry } from '@/actions/log-actions';
import {
	selectPreparedDishData,
	selectPreparedDishStatus
} from '@/lib/features/dish/preparedDishSlice';
import { deleted, updated } from '@/lib/features/log/logFoodSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { cn, formatUnit } from '@/lib/utils';
import { FoodEntry, GetFoodEntry, GetFoodItem } from '@/types';
import { format } from 'date-fns';
import { Clock, FilePenLine, RefreshCwOff, Trash2, X } from 'lucide-react';
import { memo, useEffect, useRef, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { RxUpdate } from 'react-icons/rx';
import { toast } from 'sonner';
import FoodCategoryIconMapper from '../food-items/food-category-icon-mapper';
import FoodItemImageGallery from '../food-items/food-item-image-gallery';
import NumberIncrementor from '../number-incrementor';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Checkbox } from '../ui/checkbox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';

const LogFoodListItem = memo(function LogFoodListItem({
	item,
	indx,
	allowEdit = false,
	onCheck,
	isDishMode = false
}: {
	item: GetFoodEntry;
	indx: number;
	allowEdit?: boolean;
	onCheck?: (data: { add: boolean; item: GetFoodEntry }) => void;
	isDishMode?: boolean;
}) {
	const dispatch = useAppDispatch();

	const footerRef = useRef<HTMLDivElement>(null);

	const [isEditing, setIsEditing] = useState(false);
	const [servingSize, setServingSize] = useState(item.numServings);
	const [isDeleting, setIsDeleting] = useTransition();
	const [isUpdating, setIsUpdating] = useTransition();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isChecked, setIsChecked] = useState<boolean | undefined>();

	const preparedDishData = useAppSelector(selectPreparedDishData);
	const preparedDishStatus = useAppSelector(selectPreparedDishStatus);

	useEffect(() => {
		if (
			preparedDishStatus === 'added' ||
			preparedDishStatus === 'cleared' ||
			preparedDishStatus === 'updated'
		) {
			setIsChecked(false);
		}
	}, [preparedDishData, preparedDishStatus]);

	useEffect(() => {
		if (typeof isChecked !== 'undefined') {
			onCheck?.({ add: isChecked, item });
		}
	}, [isChecked]);

	const [fadeClass, setFadeClass] = useState(false);
	useEffect(() => {
		setTimeout(
			() => {
				setFadeClass(true);
			},
			indx === 0 ? 1 : indx * 10
		);
	}, []);

	useEffect(() => {
		if (isEditing && footerRef.current) {
			footerRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'center',
				inline: 'center'
			});

			fetchFoodItem();
		}
	}, [isEditing]);

	const [foodItem, setFoodItem] = useState<GetFoodItem>();

	const fetchFoodItem = async () => {
		const res = await getFoodItemById(item.id);

		if (res.success && res.data) {
			setFoodItem(res.data as GetFoodItem);
		}
	};

	return (
		<Card
			className={cn(
				'transition-opacity opacity-0 duration-1000 select-none p-0',
				isEditing && 'bg-green-900'
			)}
			style={{
				opacity: fadeClass ? 1 : 0
			}}>
			<CardHeader className='flex flex-row items-start justify-between gap-2 pt-2 pl-4 pb-0 pr-2'>
				<div className='capitalize font-semibold flex flex-row justify-between gap-2 w-full items-center'>
					<div className='text-sm flex flex-col items-start gap-0 w-full'>
						<div className='text-sm flex flex-row items-start gap-2 relative'>
							{!isDishMode && (
								<div className='absolute -top-2.5 -left-4'>
									<Checkbox
										checked={isChecked}
										onCheckedChange={(val) => setIsChecked(!!val)}
									/>
								</div>
							)}

							<FoodCategoryIconMapper type={item.category} />
							<div
								className='leading-tight'
								onClick={(e) => {
									e.preventDefault();

									setIsEditing(!isEditing);
								}}>
								{item.name}
							</div>
						</div>

						<div className='text-xs font-normal text-muted-foreground flex flex-row items-center justify-between gap-2 w-full'>
							<div>
								{formatUnit(servingSize)}{' '}
								{servingSize === 1 ? 'serving' : 'servings'}
							</div>

							<div className='flex flex-row items-center gap-1 whitespace-nowrap text-muted-foreground'>
								{formatUnit(item.calories * item.numServings)} cals
							</div>

							{!isDishMode && (
								<div className='flex flex-row items-center gap-1 whitespace-nowrap text-muted-foreground'>
									<Clock className='w-4 h-4' />
									{format(item.eatenAt, 'h:mm a')}
								</div>
							)}
						</div>
					</div>

					{!isEditing && allowEdit && (
						<div className='flex flex-row gap-2 justify-between pb-2'>
							<Button
								variant='outline'
								size={'icon'}
								onClick={() => {
									setIsEditing(!isEditing);
								}}>
								<FilePenLine className='w-4 h-4' />
							</Button>
							<Dialog
								open={dialogOpen}
								onOpenChange={setDialogOpen}>
								<DialogTrigger asChild>
									<Button
										variant='outline'
										size={'icon'}>
										<X className='w-4 h-4' />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogTitle>Confirm Delete</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete? This action cannot be
										undone.
									</DialogDescription>
									<div className='flex flex-row items-center justify-center'>
										<Button
											disabled={isDeleting}
											onClick={() => {
												setIsDeleting(async () => {
													const res = await deleteFoodLogEntry(item.id);

													if (res.success) {
														toast.success(res.message);

														// redux
														dispatch(
															deleted({
																id: item.id,
																name: item.name,
																servings: item.numServings
															})
														);
													} else {
														toast.error(res.message);
													}
												});

												setDialogOpen(false);
											}}>
											{isDeleting ? (
												<ImSpinner2 className='w-4 h-4 animate-spin' />
											) : (
												<Trash2 className='w-4 h-4' />
											)}
											{isDeleting ? 'Deleting' : 'Delete'}
										</Button>
									</div>
								</DialogContent>
							</Dialog>
						</div>
					)}
				</div>
			</CardHeader>

			<CardContent className='px-4 pb-0'>
				{isEditing && (
					<div
						className='flex flex-col items-center gap-2 mt-2'
						ref={footerRef}>
						<div className='flex flex-row flex-wrap gap-2 items-center justify-between'>
							<CardDescription className='px-4 pb-4 text-xs w-full'>
								{item.description}
							</CardDescription>
							<Badge
								variant='secondary'
								className='w-16'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal text-muted-foreground'>Carbs</div>
									<div className='whitespace-nowrap'>
										{formatUnit(item.carbGrams * servingSize)} g
									</div>
								</div>
							</Badge>
							<Badge
								variant='secondary'
								className='w-16'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal text-muted-foreground'>
										Protein
									</div>
									<div className='whitespace-nowrap'>
										{formatUnit(item.proteinGrams * servingSize)} g
									</div>
								</div>
							</Badge>
							<Badge
								variant='secondary'
								className='w-16'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal text-muted-foreground'>Fat</div>
									<div className='whitespace-nowrap'>
										{formatUnit(item.fatGrams * servingSize)} g
									</div>
								</div>
							</Badge>
							<Badge className='w-16'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal'>Calories</div>
									<div>{formatUnit(item.calories * servingSize)}</div>
								</div>
							</Badge>
						</div>

						<NumberIncrementor
							compactMode={true}
							onChange={(value) => {
								setServingSize(value);
							}}
							allowDecimalIncrement={true}
							minValue={0.1}
							value={servingSize}
						/>

						<div className='flex flex-row items-center justify-between gap-2 w-full mt-4 pb-2'>
							<Button
								variant='secondary'
								onClick={() => {
									setIsEditing(false);
									setServingSize(item.numServings);
								}}>
								<RefreshCwOff className='w-4 h-4' />
								Cancel
							</Button>
							<Button
								onClick={() => {
									setIsUpdating(async () => {
										const updatedEntry: FoodEntry = {
											...item,
											numServings: servingSize
										};

										const res = await updateFoodLogEntry(updatedEntry);

										if (res.success) {
											toast.success(res.message);

											if (res.data) {
												const { numServings } = res.data;

												setIsUpdating(() => {
													setServingSize(formatUnit(numServings));
												});

												// redux
												dispatch(
													updated({
														name: item.name,
														servings: formatUnit(numServings)
													})
												);
											}
										} else {
											toast.error(res.message);
										}
									});

									setIsEditing(false);
								}}>
								<RxUpdate
									className={cn('w-4 h-4', isUpdating && 'animate-spin')}
								/>
								{isUpdating ? 'Updating...' : 'Update'}
							</Button>
						</div>

						<div className='w-full'>
							{foodItem && <FoodItemImageGallery item={foodItem} />}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
});

export default LogFoodListItem;

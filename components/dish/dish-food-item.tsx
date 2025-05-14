'use client';

import { setCheckedItemState } from '@/lib/features/dish/preparedDishSlice';
import { useAppDispatch } from '@/lib/hooks';
import { cn, formatUnit } from '@/lib/utils';
import { GetFoodEntry } from '@/types';
import { FilePenLine, RefreshCwOff, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { RxUpdate } from 'react-icons/rx';
import FoodCategoryIconMapper from '../food-items/food-category-icon-mapper';
import NumberIncrementor from '../number-incrementor';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';

export default function DishFoodItem({
	item,
	indx,
	onEdit,
	onDelete,
	inEditState,
	readOnly = false,
	noDeleteButton = false
}: {
	item: GetFoodEntry;
	indx: number;
	onEdit?: (item: GetFoodEntry) => void;
	onDelete?: (item: GetFoodEntry) => void;
	inEditState?: (val: boolean) => void;
	readOnly?: boolean;
	noDeleteButton?: boolean;
}) {
	const dispatch = useAppDispatch();
	const footerRef = useRef<HTMLDivElement>(null);

	const [isEditing, setIsEditing] = useState(false);
	const [foodItem, setFoodItem] = useState<GetFoodEntry>(item);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const [dialogOpen, setDialogOpen] = useState(false);

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
		}

		inEditState?.(isEditing);
	}, [isEditing]);

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
					<div className='text-sm flex flex-col items-start gap-0 w-full relative'>
						<div className='text-sm flex flex-row items-start gap-2 relative'>
							<FoodCategoryIconMapper type={foodItem.category} />
							<div
								className='leading-tight'
								onClick={(e) => {
									e.preventDefault();

									if (readOnly) {
										return;
									}

									setIsEditing(!isEditing);
								}}>
								{item.name}
							</div>
						</div>

						<div className='text-xs font-normal text-muted-foreground flex flex-row items-center justify-between gap-2 w-full'>
							<div>
								{foodItem.numServings}{' '}
								{foodItem.numServings === 1 ? 'serving' : 'servings'}
							</div>

							<div className='flex flex-row items-center gap-1 whitespace-nowrap text-muted-foreground'>
								{formatUnit(foodItem.calories * foodItem.numServings)} cals
							</div>
						</div>

						{readOnly && !noDeleteButton && (
							<div className='absolute -top-4 -right-4'>
								<Button
									onClick={(e) => {
										e.preventDefault();

										dispatch(
											setCheckedItemState({
												id: '',
												name: '',
												description: '',
												dishList: '',
												checkedItem: JSON.stringify({
													add: false,
													item: foodItem
												})
											})
										);
									}}
									size={'icon'}
									variant={'ghost'}>
									<X />
								</Button>
							</div>
						)}
					</div>

					{!isEditing && !readOnly && (
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
											onClick={async () => {
												setIsDeleting(true);
												onDelete?.(foodItem);
												setIsDeleting(false);
												setDialogOpen(false);
											}}>
											{isDeleting ? (
												<FaSpinner className='w-4 h-4 animate-spin' />
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
				{isEditing && !readOnly && (
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
										{formatUnit(foodItem.carbGrams * foodItem.numServings)} g
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
										{formatUnit(foodItem.proteinGrams * foodItem.numServings)} g
									</div>
								</div>
							</Badge>
							<Badge
								variant='secondary'
								className='w-16'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal text-muted-foreground'>Fat</div>
									<div className='whitespace-nowrap'>
										{formatUnit(foodItem.fatGrams * foodItem.numServings)} g
									</div>
								</div>
							</Badge>
							<Badge className='w-16'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal'>Calories</div>
									<div>
										{formatUnit(foodItem.calories * foodItem.numServings)}
									</div>
								</div>
							</Badge>
						</div>

						<NumberIncrementor
							compactMode={true}
							onChange={(value) => {
								const upd = { ...foodItem };
								upd.numServings = value;

								setFoodItem(upd);
							}}
							allowDecimalIncrement={true}
							minValue={0.1}
							value={foodItem.numServings}
						/>

						<div className='flex flex-row items-center justify-between gap-2 w-full mt-4 pb-2'>
							<Button
								variant='secondary'
								onClick={() => {
									setIsEditing(false);

									setFoodItem(item);
								}}>
								<RefreshCwOff className='w-4 h-4' />
								Cancel
							</Button>
							<Button
								onClick={() => {
									setIsUpdating(true);

									// edit the cals and macros on edit to update dish list
									onEdit?.(foodItem);

									setIsUpdating(false);
									setIsEditing(false);
								}}>
								<RxUpdate
									className={cn('w-4 h-4', isUpdating && 'animate-spin')}
								/>
								{isUpdating ? 'Updating...' : 'Update'}
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

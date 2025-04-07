'use client';

import { FoodEntry, GetFoodEntry } from '@/types';
import { Card, CardContent, CardDescription, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { format } from 'date-fns';
import { Clock, FilePenLine, RefreshCwOff, Trash2, X } from 'lucide-react';
import { cn, formatUnit } from '@/lib/utils';
import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import { useEffect, useRef, useState } from 'react';
import NumberIncrementor from '../number-incrementor';
import { deleteFoodLogEntry, updateFoodLogEntry } from '@/actions/log-actions';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import { RxUpdate } from 'react-icons/rx';
import FoodCategoryIconMapper from '../food-items/food-category-icon-mapper';
import { useAppDispatch } from '@/lib/hooks';
import { deleted, updated } from '@/lib/features/log/logFoodSlice';

export default function LogFoodListItem({
	item,
	indx,
	allowEdit = false
}: {
	item: GetFoodEntry;
	indx: number;
	allowEdit?: boolean;
}) {
	const dispatch = useAppDispatch();

	const footerRef = useRef<HTMLDivElement>(null);

	const [isEditing, setIsEditing] = useState(false);
	const [servingSize, setServingSize] = useState(item.numServings);
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
					<div
						className='text-sm flex flex-col items-start gap-0'
						onClick={(e) => {
							e.preventDefault();

							setIsEditing(!isEditing);
						}}>
						<div className='text-sm flex flex-row items-start gap-2'>
							<FoodCategoryIconMapper type={item.category} />
							<div className='leading-tight'>{item.name}</div>
						</div>

						<div className='pl-8 text-xs font-normal text-muted-foreground flex flex-row items-center gap-2'>
							<div className='w-20'>
								{servingSize} {servingSize === 1 ? 'serving' : 'servings'}
							</div>

							<div className='flex flex-row items-center gap-1 whitespace-nowrap text-muted-foreground'>
								<Clock className='w-4 h-4' />
								{format(item.eatenAt, 'h:mm a')}
							</div>
						</div>
					</div>

					{!isEditing && allowEdit && (
						<div className='flex flex-row flex-wrap gap-2 justify-between pb-2'>
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
												const res = await deleteFoodLogEntry(item.id);

												if (res.success) {
													toast.success(res.message);

													// redux
													dispatch(
														deleted({
															name: item.name,
															servings: item.numServings
														})
													);
												} else {
													toast.error(res.message);
												}

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
								onClick={async () => {
									setIsUpdating(true);

									const updatedEntry: FoodEntry = {
										...item,
										numServings: servingSize
									};

									const res = await updateFoodLogEntry(updatedEntry);

									if (res.success) {
										toast.success(res.message);

										if (res.data) {
											const { numServings } = res.data;

											setServingSize(numServings);

											// redux
											dispatch(
												updated({
													name: item.name,
													servings: numServings
												})
											);
										}
									} else {
										toast.error(res.message);
									}

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

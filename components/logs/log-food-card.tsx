'use client';

import { FoodEntry, GetFoodEntry } from '@/types';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader
} from '../ui/card';
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
import { useContext, useEffect, useState } from 'react';
import NumberIncrementor from '../number-incrementor';
import { deleteFoodLogEntry, updateFoodLogEntry } from '@/actions/log-actions';
import { FaSpinner } from 'react-icons/fa';
import { toast } from 'sonner';
import { LogUpdateContext } from '@/contexts/log-context';
import { RxUpdate } from 'react-icons/rx';
import FoodCategoryIconMapper from '../food-items/food-category-icon-mapper';

export default function LogFoodCard({
	item,
	indx,
	allowEdit = false
}: {
	item: GetFoodEntry;
	indx: number;
	allowEdit?: boolean;
}) {
	const [isEditing, setIsEditing] = useState(false);
	const [servingSize, setServingSize] = useState(item.numServings);
	const [isDeleting, setIsDeleting] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const logContext = useContext(LogUpdateContext);
	const [dialogOpen, setDialogOpen] = useState(false);

	useEffect(() => {}, [servingSize]);

	const updateLogContext = () => {
		if (logContext && logContext.isUpdated) {
			const update = {
				...logContext,
				updated: true
			};

			logContext.isUpdated(update);
		}
	};

	const [fadeClass, setFadeClass] = useState(false);
	useEffect(() => {
		setTimeout(
			() => {
				setFadeClass(true);
			},
			indx === 0 ? 1 : indx * 10
		);
	}, []);

	return (
		<Card
			className='transition-opacity opacity-0 duration-1000 select-none'
			style={{
				opacity: fadeClass ? 1 : 0
			}}>
			<CardHeader className='pb-2 flex flex-row items-center justify-between gap-2 pt-2'>
				<div className='capitalize font-semibold '>
					<div className='text-2xl portrait:text-lg flex flex-row items-center gap-2'>
						<FoodCategoryIconMapper type={item.category} />
						<div className='leading-tight'>{item.name}</div>
					</div>
					<span className='text-muted-foreground flex flex-row items-center'>
						{servingSize} {servingSize === 1 ? 'serving' : 'servings'}
					</span>
				</div>
				<Badge
					variant='outline'
					className='flex flex-row items-center gap-2 p-2 whitespace-nowrap'>
					<Clock className='w-4 h-4' />
					{format(item.eatenAt, 'hh:mm a')}
				</Badge>
			</CardHeader>
			<CardDescription className='px-6 pb-4 text-xs'>
				{item.description}
			</CardDescription>
			<CardContent className='px-4'>
				<div className='flex flex-row flex-wrap gap-2 items-center'>
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
							<div className='font-normal text-muted-foreground'>Protein</div>
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

				{isEditing && (
					<div className='flex flex-col items-center gap-2 mt-4'>
						<NumberIncrementor
							compactMode={true}
							onChange={(value) => {
								setServingSize(value);
							}}
							allowDecimalIncrement={true}
							minValue={0.1}
							value={servingSize}
						/>

						<div className='flex flex-row items-center justify-between gap-2 w-full mt-4'>
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
										toast(res.message);

										if (res.data) {
											const { numServings } = res.data;

											setServingSize(numServings);
										}

										updateLogContext();
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

			{!isEditing && allowEdit && (
				<CardFooter className='flex flex-row flex-wrap gap-2 justify-between'>
					<Button
						variant='outline'
						onClick={() => {
							setIsEditing(!isEditing);
						}}>
						<FilePenLine className='w-4 h-4' />
						Edit
					</Button>
					<Dialog
						open={dialogOpen}
						onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button variant='outline'>
								<X className='w-4 h-4' />
								Delete
							</Button>
						</DialogTrigger>
						<DialogContent>
							<DialogTitle>Confirm Delete</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete? This action cannot be undone.
							</DialogDescription>
							<div className='flex flex-row items-center justify-center'>
								<Button
									disabled={isDeleting}
									onClick={async () => {
										setIsDeleting(true);
										const res = await deleteFoodLogEntry(item.id);

										if (res.success) {
											toast(res.message);

											updateLogContext();
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
				</CardFooter>
			)}
		</Card>
	);
}

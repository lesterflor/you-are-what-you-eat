'use client';

import { deleteFoodLogEntry, updateFoodLogEntry } from '@/actions/log-actions';
import { deleted, updated } from '@/lib/features/log/logFoodSlice';
import { useAppDispatch } from '@/lib/hooks';
import { cn, formatUnit } from '@/lib/utils';
import { FoodEntry, GetFoodEntry } from '@/types';
import { format } from 'date-fns';
import { Clock, FilePenLine, RefreshCwOff, Trash2, X } from 'lucide-react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { RxUpdate } from 'react-icons/rx';
import { toast } from 'sonner';
import FoodCategoryIconMapper from '../food-items/food-category-icon-mapper';
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
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';

export default function LogFoodCard({
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
	const [isDeleting, setIsDeleting] = useTransition();
	const [isUpdating, setIsUpdating] = useTransition();
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
			<CardHeader className='pb-2 flex flex-row items-start justify-between gap-2 pt-2 pl-4 pr-2'>
				<div className='capitalize font-semibold '>
					<div className='text-2xl portrait:text-lg flex flex-row items-start gap-2'>
						<FoodCategoryIconMapper type={item.category} />
						<div className='leading-tight'>{item.name}</div>
					</div>
					<span className='text-muted-foreground flex flex-row items-center'>
						{formatUnit(servingSize)}{' '}
						{servingSize === 1 ? 'serving' : 'servings'}
					</span>
				</div>
				<Badge
					variant='outline'
					className='flex flex-row items-center gap-2 p-2 whitespace-nowrap !mt-0 text-muted-foreground'>
					<Clock className='w-4 h-4' />
					{format(item.eatenAt, 'hh:mm a')}
				</Badge>
			</CardHeader>
			<CardDescription className='px-4 pb-4 text-xs'>
				{item.description}
			</CardDescription>
			<CardContent className='px-4'>
				<div className='flex flex-row flex-wrap gap-2 items-center justify-between'>
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
					<div
						className='flex flex-col items-center gap-2 mt-4'
						ref={footerRef}>
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
									});

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
				<CardFooter className='flex flex-row flex-wrap gap-2 justify-between pb-2'>
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
									onClick={() => {
										setIsDeleting(async () => {
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
				</CardFooter>
			)}
		</Card>
	);
}

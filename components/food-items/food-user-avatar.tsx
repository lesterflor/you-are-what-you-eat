'use client';

import { deleteFoodItem, getFoodItemById } from '@/actions/food-actions';
import { inputSearch, userSearch } from '@/lib/features/food/foodSearchSlice';
import {
	deleteFood,
	generateRxFoodItemSchema,
	selectFoodUpdateData,
	selectFoodUpdateStatus
} from '@/lib/features/food/foodUpdateSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { shuffle } from '@/lib/utils';
import { GetFoodItem, GetUser } from '@/types';
import {
	FilePenLine,
	SquareArrowOutUpRight,
	UtensilsCrossed,
	X
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import UpdateFoodItemForm from './update-food-item-form';

export default function FoodUserAvatar({
	user,
	foodItemId,
	selfSearch = false,
	foodItem
}: {
	user: { name: string; image: string; id: string; FoodItems: GetFoodItem[] };
	foodItemId: string;
	selfSearch?: boolean;
	foodItem?: GetFoodItem;
}) {
	const dispatch = useAppDispatch();

	const foodUpdateData = useAppSelector(selectFoodUpdateData);
	const foodUpdateStatus = useAppSelector(selectFoodUpdateStatus);

	const DISPLAY_LIMIT = 2;
	const { name, image = '', id, FoodItems: items = [] } = user;

	const getCurrentFood = async () => {
		const res = await getFoodItemById(foodItemId);

		if (res.success) {
			setEditFoodItem(res.data as GetFoodItem);
		}
	};

	const [editFoodItem, setEditFoodItem] = useState<GetFoodItem>();
	const [foods, setFoods] = useState(items);
	const [showSeeMore, setShowSeeMore] = useState(false);
	const [popOpen, setPopOpen] = useState(false);
	const [currentFood, setCurrentFood] = useState<GetFoodItem[]>([]);
	const [editFormOpen, setEditFormOpen] = useState(false);

	useEffect(() => {
		const filter = items.filter(
			(item) => item.id !== foodItemId && item.category === foodItem?.category
		);

		shuffle(filter);

		setCurrentFood(items.filter((item) => item.id === foodItemId));

		const limit = filter.slice(0, DISPLAY_LIMIT);

		setShowSeeMore(filter.length > DISPLAY_LIMIT);

		setFoods(limit);
	}, []);

	const { data: session } = useSession();
	const sessionUser = session?.user as GetUser;

	useEffect(() => {
		if (foodUpdateStatus !== 'idle') {
			getCurrentFood();
		}
	}, [foodUpdateStatus, foodUpdateData]);

	useEffect(() => {
		if (!editFormOpen) {
			setPopOpen(false);
		}
	}, [editFormOpen]);

	const [ref, isIntersecting] = useInView({
		rootMargin: '-0% 0% -25% 0%'
	});

	useEffect(() => {
		if (!isIntersecting) {
			//setPopOpen(false);
		}
	}, [isIntersecting]);

	const [isDeleting, setIsDeleting] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

	const deleteUserFood = async () => {
		if (currentFood.length === 0) {
			return;
		}
		setIsDeleting(true);
		const res = await deleteFoodItem(currentFood[0].id);

		if (res.success && res.data) {
			// redux
			dispatch(deleteFood(generateRxFoodItemSchema(res.data as GetFoodItem)));

			toast.success(res.message);
			setDeleteDialogOpen(false);

			setPopOpen(false);
		} else {
			toast.error(res.message);
		}

		setIsDeleting(false);
	};

	return (
		<Popover
			open={popOpen}
			onOpenChange={setPopOpen}>
			<PopoverTrigger>
				<Avatar className='w-6 h-6'>
					<AvatarImage src={image as string} />
					<AvatarFallback className='!text-lg'>
						{name.slice(0, 1)}
					</AvatarFallback>
				</Avatar>
			</PopoverTrigger>
			<PopoverContent
				ref={ref}
				className='flex flex-col gap-4 max-h-[50vh] h-auto items-center'>
				{sessionUser.id === id && currentFood && currentFood.length === 1 && (
					<div className='flex flex-col gap-1 items-center w-full'>
						<div className='flex flex-row items-center gap-2 pb-2'>
							<FoodCategoryIconMapper type={currentFood[0].category} />
							<div className='capitalize'>{currentFood[0].name}</div>
						</div>

						<div className='flex flex-row justify-between w-full'>
							<Sheet
								open={editFormOpen}
								onOpenChange={setEditFormOpen}>
								<SheetTrigger asChild>
									<Button
										size='sm'
										onClick={() => {
											getCurrentFood();
										}}>
										<FilePenLine className='w-4 h-4' />
										Edit
									</Button>
								</SheetTrigger>

								<SheetContent className='max-w-[95vw] portrait:w-[95vw]'>
									<SheetTitle className='flex flex-row items-center justify-start flex-wrap gap-2 pb-4'>
										<div className='flex flex-row items-center gap-2 justify-start'>
											<FilePenLine className='w-4 h-4' /> Edit
										</div>
										<Badge
											variant='secondary'
											className='text-sm p-2 select-none font-normal'>
											{editFoodItem?.name}
										</Badge>
									</SheetTitle>
									<SheetDescription></SheetDescription>
									<ScrollArea className='h-[80vh] portrait:h-[70vh] w-full pr-3'>
										{editFoodItem && (
											<UpdateFoodItemForm
												item={editFoodItem as GetFoodItem}
												onSuccess={() => {
													setEditFormOpen(false);
												}}
											/>
										)}

										<br />
									</ScrollArea>
								</SheetContent>
							</Sheet>

							<div>
								<Dialog
									open={deleteDialogOpen}
									onOpenChange={setDeleteDialogOpen}>
									<DialogTrigger asChild>
										<Button size='sm'>
											<X />
											Delete
										</Button>
									</DialogTrigger>
									<DialogContent className='flex flex-col gap-4 items-center text-sm font-normal portrait:w-[95vw] rounded-md'>
										<DialogTitle>Confirm Delete</DialogTitle>
										<div className='text-muted-foreground'>
											Are you sure you want to delete{' '}
											<span className='text-foreground'>
												{currentFood[0].name}
											</span>
											? This action cannot be undone.
										</div>
										<div>
											<Button
												disabled={isDeleting}
												onClick={(e) => {
													e.preventDefault();
													deleteUserFood();
												}}>
												{isDeleting ? (
													<ImSpinner2 className='w-4 h-4 animate-spin' />
												) : (
													<X />
												)}
												Delete
											</Button>
										</div>
									</DialogContent>
								</Dialog>
							</div>
						</div>
					</div>
				)}

				{foods.length > 0 && (
					<>
						<div className='text-xs flex flex-row gap-2 w-full'>
							<UtensilsCrossed className='w-4 h-4' />
							Other Foods added by{' '}
							<span className='font-semibold'>{user.name}</span>
						</div>
						<div className='flex flex-col items-start justify-center gap-2 leading-4 w-full'>
							{foods.map((item) => (
								<Button
									onClick={() => {
										setPopOpen(false);

										if (selfSearch) {
											// should dispatch 'userInput with food'
											dispatch(inputSearch(item.name));
										}
									}}
									size='sm'
									variant='secondary'
									key={item.id}>
									{!selfSearch ? (
										<Link
											className='flex flex-row items-center gap-2 flex-wrap'
											href={`/foods?term=${item.name}`}>
											{item.name} <SquareArrowOutUpRight className='w-4 h-4' />
										</Link>
									) : (
										<>
											<SquareArrowOutUpRight className='w-4 h-4' /> {item.name}
										</>
									)}
								</Button>
							))}
						</div>
					</>
				)}

				{showSeeMore && (
					<div className='w-full flex flex-row justify-end'>
						<Button
							variant='outline'
							onClick={() => {
								setPopOpen(false);

								if (selfSearch) {
									const userClone = {
										...user,
										name: user.name === sessionUser.name ? 'you' : user.name
									};

									dispatch(userSearch(JSON.stringify(userClone)));
								}
							}}>
							{!selfSearch ? (
								<Link
									href={`/foods?user=${id}`}
									className='text-xs flex flex-row items-center gap-2 flex-wrap'>
									See all <SquareArrowOutUpRight className='w-4 h-4' />
								</Link>
							) : (
								<>
									<SquareArrowOutUpRight className='w-4 h-4' /> See all
								</>
							)}
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}

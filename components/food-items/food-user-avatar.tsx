'use client';

import { GetFoodItem, GetUser } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
	FilePenLine,
	SquareArrowOutUpRight,
	UtensilsCrossed
} from 'lucide-react';
import { SearchContext } from '@/contexts/search-context';
import { useSession } from 'next-auth/react';
import { truncate } from '@/lib/utils';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import UpdateFoodItemForm from './update-food-item-form';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { getFoodItemById } from '@/actions/food-actions';
import { UpdateFoodContext } from '@/contexts/food-update-context';
import { useInView } from 'react-intersection-observer';

export default function FoodUserAvatar({
	user,
	foodItemId,
	selfSearch = false
}: {
	user: { name: string; image: string; id: string; FoodItems: GetFoodItem[] };
	foodItemId: string;
	selfSearch?: boolean;
}) {
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
		const filter = items.filter((item) => item.id !== foodItemId);

		setCurrentFood(items.filter((item) => item.id === foodItemId));

		const limit = filter.slice(0, DISPLAY_LIMIT);

		setShowSeeMore(filter.length > DISPLAY_LIMIT);

		setFoods(limit);
	}, []);

	const searchContext = useContext(SearchContext);
	const foodUpdateContext = useContext(UpdateFoodContext);

	const { data: session } = useSession();
	const sessionUser = session?.user as GetUser;

	useEffect(() => {
		if (foodUpdateContext?.updated) {
			getCurrentFood();
		}
	}, [foodUpdateContext]);

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

	return (
		<Popover
			open={popOpen}
			onOpenChange={setPopOpen}>
			<PopoverTrigger>
				<Avatar>
					<AvatarImage src={image as string} />
					<AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
				</Avatar>
			</PopoverTrigger>
			<PopoverContent
				ref={ref}
				className='flex flex-col gap-4 max-h-[50vh] h-auto items-center'>
				{sessionUser.id === id && currentFood && currentFood.length === 1 && (
					<div>
						<Sheet
							open={editFormOpen}
							onOpenChange={setEditFormOpen}>
							<SheetTrigger
								asChild
								className='mb-5'>
								<Button
									size='sm'
									onClick={() => {
										getCurrentFood();
									}}>
									<FilePenLine className='w-4 h-4' />
									Edit{' '}
									<span className='font-semibold'>
										{truncate(currentFood[0].name, 20)}
									</span>
								</Button>
							</SheetTrigger>

							<SheetContent className='max-w-[95vw] portrait:w-[95vw]'>
								<SheetTitle className='flex flex-row items-center justify-start flex-wrap gap-2 pb-4'>
									<div className='flex flex-row items-center gap-2 justify-start'>
										<FilePenLine className='w-4 h-4' /> Edit
									</div>
									<Badge
										variant='secondary'
										className='text-sm p-2 select-none'>
										{currentFood[0].name}
									</Badge>
								</SheetTitle>
								<SheetDescription></SheetDescription>
								<ScrollArea className='h-[80vh] portrait:h-[65vh] w-full pr-3'>
									{editFoodItem && (
										<UpdateFoodItemForm
											item={editFoodItem as GetFoodItem}
											onSuccess={() => {
												setEditFormOpen(false);

												if (foodUpdateContext && foodUpdateContext.isUpdated) {
													const update = {
														...foodUpdateContext,
														updated: true
													};
													foodUpdateContext.isUpdated(update);
												}
											}}
										/>
									)}

									<br />
								</ScrollArea>
							</SheetContent>
						</Sheet>
					</div>
				)}

				<div className='text-xs flex flex-row gap-2'>
					<UtensilsCrossed className='w-4 h-4' />
					Other Foods added by{' '}
					<span className='font-semibold'>{user.name}</span>
				</div>
				<div className='flex flex-col items-start justify-center gap-2 leading-4'>
					{foods.length &&
						foods.map((item) => (
							<Button
								onClick={() => {
									setPopOpen(false);

									if (selfSearch) {
										if (searchContext && searchContext.updateSearchType) {
											const update = {
												...searchContext,
												searchType: { name: item.name }
											};

											searchContext.updateSearchType(update);
										}
									}
								}}
								size='sm'
								variant='secondary'
								key={item.id}>
								{!selfSearch ? (
									<Link
										className='flex flex-row items-center gap-2 flex-wrap'
										href={`/foods?q=${item.name}`}>
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
				{showSeeMore && (
					<div className='w-full flex flex-row justify-end'>
						<Button
							variant='outline'
							onClick={() => {
								setPopOpen(false);

								if (selfSearch) {
									//onLinkClick?.({ userId: id });

									if (searchContext && searchContext.updateSearchType) {
										const update = {
											...searchContext,
											searchType: { userId: id }
										};

										searchContext.updateSearchType(update);
									}
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

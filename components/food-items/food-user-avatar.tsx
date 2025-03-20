'use client';

import { GetFoodItem, GetUser } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { FilePenLine, UtensilsCrossed } from 'lucide-react';
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
import { LogUpdateContext } from '@/contexts/log-context';
import { getFoodItemById } from '@/actions/food-actions';

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
	const logContext = useContext(LogUpdateContext);

	const { data: session } = useSession();
	const sessionUser = session?.user as GetUser;

	useEffect(() => {
		if (logContext?.updated) {
			getCurrentFood();
		}
	}, [logContext]);

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
			<PopoverContent className='flex flex-col gap-2 max-h-[30vh] h-auto items-center'>
				{sessionUser.id === id && currentFood && currentFood.length === 1 && (
					<div>
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
									Edit {truncate(currentFood[0].name, 20)}
								</Button>
							</SheetTrigger>
							<SheetContent>
								<SheetTitle className='flex flex-col items-start justify-center gap-2 pb-4'>
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
								<ScrollArea className='h-[80vh] w-full pr-3'>
									{editFoodItem && (
										<UpdateFoodItemForm
											item={editFoodItem as GetFoodItem}
											onSuccess={() => {
												setEditFormOpen(false);

												if (logContext && logContext.isUpdated) {
													const update = {
														...logContext,
														updated: true
													};
													logContext.isUpdated(update);
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
										//onLinkClick?.({ name: item.name });
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
									<Link href={`/foods?q=${item.name}`}>{item.name}</Link>
								) : (
									item.name
								)}
							</Button>
						))}
				</div>
				{showSeeMore && (
					<div className='w-full flex flex-row justify-end'>
						<Button
							variant='ghost'
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
									className='text-xs'>
									...See all
								</Link>
							) : (
								'...See all'
							)}
						</Button>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}

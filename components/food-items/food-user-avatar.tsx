'use client';

import { GetFoodItem } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useContext, useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';
import { SearchContext } from '@/contexts/search-context';

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

	const [foods, setFoods] = useState(items);
	const [showSeeMore, setShowSeeMore] = useState(false);
	const [popOpen, setPopOpen] = useState(false);

	useEffect(() => {
		const filter = items.filter((item) => item.id !== foodItemId);

		const limit = filter.slice(0, DISPLAY_LIMIT);

		setShowSeeMore(filter.length > DISPLAY_LIMIT);

		setFoods(limit);
	}, []);

	const searchContext = useContext(SearchContext);

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

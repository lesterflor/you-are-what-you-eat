'use client';

import { GetFoodItem } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import Link from 'next/link';
import { UtensilsCrossed } from 'lucide-react';

export default function FoodUserAvatar({
	user,
	foodItemId
}: {
	user: { name: string; image: string; id: string; FoodItems: GetFoodItem[] };
	foodItemId: string;
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
								}}
								size='sm'
								variant='secondary'
								key={item.id}
								asChild>
								<Link href={`/foods?q=${item.name}`}>{item.name}</Link>
							</Button>
						))}
				</div>
				{showSeeMore && (
					<div className='w-full flex flex-row justify-end'>
						<Link
							onClick={() => {
								setPopOpen(false);
							}}
							href={`/foods?user=${id}`}
							className='text-xs'>
							...See more
						</Link>
					</div>
				)}
			</PopoverContent>
		</Popover>
	);
}

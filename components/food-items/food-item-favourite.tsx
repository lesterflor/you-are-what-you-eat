'use client';

import {
	bookmarkFoodItem,
	checkFoodItemBookmarked
} from '@/actions/food-actions';
import { addBookmark, removeBookmark } from '@/lib/features/food/bookmarkSlice';
import { useAppDispatch } from '@/lib/hooks';
import { GetFoodItem } from '@/types';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useTransition } from 'react';
import { BsBookmarkPlus, BsBookmarkStarFill } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';
import { useInView } from 'react-intersection-observer';

export default function FoodItemFavourite({ item }: { item: GetFoodItem }) {
	const query = useQueryClient();

	const dispatch = useAppDispatch();
	const [isBookmarked, setIsBookmarked] = useState(false);
	const [isBookmarking, setIsBookmarking] = useTransition();
	const [ref, isInView] = useInView();

	const checkBookmark = async () => {
		const res = await checkFoodItemBookmarked(item.id);

		if (res.success) {
			setIsBookmarked(!!res.data);
		}
	};

	const toggleBookmark = () => {
		setIsBookmarking(async () => {
			const res = await bookmarkFoodItem(item.id);

			if (res.success) {
				setIsBookmarking(() => {
					const isBookmarked = !!res.bookmarked;

					setIsBookmarked(isBookmarked);

					dispatch(
						isBookmarked
							? addBookmark(JSON.stringify({ id: item.id, name: item.name }))
							: removeBookmark(JSON.stringify({ id: item.id, name: item.name }))
					);

					// tanstack refresh fav list
					query.invalidateQueries({ queryKey: ['favs'] });
				});
			}
		});
	};

	useEffect(() => {
		if (isInView) {
			checkBookmark();
		}
	}, [isInView]);

	return (
		<>
			{isBookmarking ? (
				<div>
					<ImSpinner2 className='w-6 h-6 animate-spin text-teal-600' />
				</div>
			) : (
				<div
					onClick={toggleBookmark}
					ref={ref}>
					{isBookmarked ? (
						<BsBookmarkStarFill className='w-6 h-6 text-teal-600' />
					) : (
						<BsBookmarkPlus className='w-6 h-6' />
					)}
				</div>
			)}
		</>
	);
}

'use client';

import {
	bookmarkFoodItem,
	checkFoodItemBookmarked
} from '@/actions/food-actions';
import { GetFoodItem } from '@/types';
import { useEffect, useState, useTransition } from 'react';
import { BsBookmarkPlus, BsBookmarkStarFill } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';
import { useInView } from 'react-intersection-observer';

export default function FoodItemFavourite({ item }: { item: GetFoodItem }) {
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
					setIsBookmarked(!!res.bookmarked);
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

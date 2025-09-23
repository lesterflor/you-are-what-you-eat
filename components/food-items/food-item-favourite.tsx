'use client';

import { addBookmark, removeBookmark } from '@/lib/features/food/bookmarkSlice';
import { useAppDispatch } from '@/lib/hooks';
import { bookmarkFoodItemMutationOptions } from '@/lib/mutations/foodMutations';
import { getIsFoodItemBookmarkedQueryOptions } from '@/lib/queries/favouriteQueries';
import { GetFoodItem } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { memo } from 'react';
import { BsBookmarkPlus, BsBookmarkStarFill } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';
import { useInView } from 'react-intersection-observer';

const FoodItemFavourite = memo(function FoodItemFavourite({
	item
}: {
	item: GetFoodItem;
}) {
	const dispatch = useAppDispatch();
	const [ref, isInView] = useInView({ triggerOnce: true });

	const { data: isBookmarked } = useQuery(
		getIsFoodItemBookmarkedQueryOptions(item.id, isInView)
	);

	const { mutate: bookmarkMtn, isPending } = useMutation(
		bookmarkFoodItemMutationOptions(item.id)
	);

	const toggleBookmark = () => {
		bookmarkMtn(item.id, {
			onSuccess: () => {
				// local state
				dispatch(
					isBookmarked
						? addBookmark(JSON.stringify({ id: item.id, name: item.name }))
						: removeBookmark(JSON.stringify({ id: item.id, name: item.name }))
				);
			}
		});
	};

	return (
		<>
			{isPending ? (
				<div>
					<ImSpinner2 className='w-6 h-6 animate-spin text-teal-600' />
				</div>
			) : (
				<div
					onClick={toggleBookmark}
					ref={ref}>
					{!!isBookmarked ? (
						<BsBookmarkStarFill className='w-6 h-6 text-teal-600' />
					) : (
						<BsBookmarkPlus className='w-6 h-6' />
					)}
				</div>
			)}
		</>
	);
});

export default FoodItemFavourite;

import {
	checkFoodItemBookmarked,
	getFavouriteFoods
} from '@/actions/food-actions';
import { queryOptions } from '@tanstack/react-query';

export function getFavouriteQueryOptions() {
	return queryOptions({
		queryKey: ['favsQry'],
		queryFn: getFavouriteFoods,
		select: (res) => res.data
	});
}

export function getIsFoodItemBookmarkedQueryOptions(
	itemId: string,
	enabled = true
) {
	return queryOptions({
		queryKey: ['isBookmarkedQry', itemId],
		queryFn: () => checkFoodItemBookmarked(itemId),
		select: (res) => res.data,
		enabled
	});
}

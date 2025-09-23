import {
	checkFoodItemBookmarked,
	getFavouriteFoods
} from '@/actions/food-actions';
import { queryOptions } from '@tanstack/react-query';
import { getStorageItem } from '../utils';

export function getFavouriteQueryOptions() {
	return queryOptions({
		queryKey: ['favs'],
		queryFn: getFavouriteFoods,
		select: (res) => res.data,
		initialData: getStorageItem('foodFavs') || []
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

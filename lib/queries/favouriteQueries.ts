import { getFavouriteFoods } from '@/actions/food-actions';
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

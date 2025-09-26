import { getFoodItemById, getFoodItems } from '@/actions/food-actions';
import { GetFoodItem } from '@/types';
import { queryOptions } from '@tanstack/react-query';
import { getStorageItem } from '../utils';

export function getFoodQueryOptions() {
	return queryOptions({
		queryKey: ['foodList'],
		queryFn: () => getFoodItems(),
		initialData: () => {
			const items = getStorageItem('foodList');

			return { data: items };
		},
		select: (res) => res.data as GetFoodItem[],
		staleTime: 1 * 1000
	});
}

export function getFoodItemByIdQueryOptions(
	id: string,
	enabled: boolean = false
) {
	return queryOptions({
		queryKey: ['getFoodItem', id],
		queryFn: () => getFoodItemById(id),
		enabled,
		select: (res) => res.data
	});
}

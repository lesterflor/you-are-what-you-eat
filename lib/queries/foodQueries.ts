import { getFoodItems } from '@/actions/food-actions';
import { GetFoodItem } from '@/types';
import { queryOptions } from '@tanstack/react-query';
import { getStorageItem } from '../utils';

export function getFoodQueryOptions() {
	return queryOptions({
		queryKey: ['foodList'],
		queryFn: () => getFoodItems(),
		placeholderData: getStorageItem('foodList') || [],
		select: (res) => res.data as GetFoodItem[],
		staleTime: 60 * 1000
	});
}

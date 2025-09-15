import { getAllDishes } from '@/actions/prepared-dish-actions';
import { queryOptions } from '@tanstack/react-query';
import { getStorageItem } from '../utils';

export function getAllDishesOptions() {
	return queryOptions({
		queryKey: ['dishes'],
		queryFn: getAllDishes,
		select: (res) => res.data,
		initialData: () => getStorageItem('preparedDishes') || []
	});
}

import {
	getAllDishes,
	getAllDishesByUser,
	getDishImages
} from '@/actions/prepared-dish-actions';
import { GetPreparedDish } from '@/types';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import { getStorageItem } from '../utils';

export function getAllDishesOptions() {
	return queryOptions({
		queryKey: ['dishes'],
		queryFn: () => getAllDishes(),
		initialData: () => {
			const items: GetPreparedDish[] = getStorageItem('preparedDishes');

			return { data: items } as {
				success: boolean;
				message: string;
				data: GetPreparedDish[];
			};
		},
		select: (res) => res.data as GetPreparedDish[],
		staleTime: 5 * 1000
	});
}

export function getAllDishesByUserOptions() {
	return queryOptions({
		queryKey: ['userDishes'],
		queryFn: getAllDishesByUser,
		select: (res) => res.data
	});
}

export function getDishImagesOptions(id: string, enabled: boolean = true) {
	return queryOptions({
		queryKey: ['dishImages', id],
		queryFn: () => getDishImages(id),
		select: (res) => res.data,
		enabled,
		placeholderData: keepPreviousData
	});
}

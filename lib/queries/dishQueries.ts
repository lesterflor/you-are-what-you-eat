import {
	getAllDishes,
	getAllDishesByUser,
	getDishImages
} from '@/actions/prepared-dish-actions';
import { keepPreviousData, queryOptions } from '@tanstack/react-query';

export function getAllDishesOptions() {
	return queryOptions({
		queryKey: ['dishes'],
		queryFn: getAllDishes,
		select: (res) => res.data
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

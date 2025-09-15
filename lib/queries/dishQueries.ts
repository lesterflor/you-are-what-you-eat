import {
	getAllDishes,
	getAllDishesByUser
} from '@/actions/prepared-dish-actions';
import { queryOptions } from '@tanstack/react-query';

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

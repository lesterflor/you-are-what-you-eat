import {
	addFoodItem,
	bookmarkFoodItem,
	deleteFoodItem,
	updateFoodItem
} from '@/actions/food-actions';
import { getQueryClient } from '@/components/query-provider';
import { FoodItem, GetFoodItem } from '@/types';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	getFavouriteQueryOptions,
	getIsFoodItemBookmarkedQueryOptions
} from '../queries/favouriteQueries';

const queryClient = getQueryClient();

export function addFoodMutationOptions() {
	return mutationOptions({
		mutationKey: ['addFoodMtn'],
		mutationFn: (item: FoodItem) => addFoodItem(item),
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		}
	});
}

export function updateFoodMutationOptions(item: GetFoodItem) {
	return mutationOptions({
		mutationKey: ['updateFoodMtn', item.id],
		mutationFn: (fi: GetFoodItem) => updateFoodItem(fi),
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		}
	});
}

export function deleteFoodMutationOptions() {
	return mutationOptions({
		mutationKey: ['deleteFoodMtn'],
		mutationFn: (id: string) => deleteFoodItem(id),
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		}
	});
}

export function bookmarkFoodItemMutationOptions(itemId: string) {
	return mutationOptions({
		mutationKey: ['bookmarkFoodMtn', itemId],
		mutationFn: (id: string) => bookmarkFoodItem(id),
		onSuccess: (res) => {
			if (res.success) {
				// invalidate the isBookmarked query
				queryClient.invalidateQueries({
					queryKey: getIsFoodItemBookmarkedQueryOptions(itemId).queryKey
				});

				// refresh fav list
				queryClient.invalidateQueries({
					queryKey: getFavouriteQueryOptions().queryKey
				});

				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		},
		onMutate: () => {}
	});
}

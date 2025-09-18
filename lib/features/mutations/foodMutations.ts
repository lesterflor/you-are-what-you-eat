import {
	addFoodItem,
	deleteFoodItem,
	updateFoodItem
} from '@/actions/food-actions';
import { FoodItem, GetFoodItem } from '@/types';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

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

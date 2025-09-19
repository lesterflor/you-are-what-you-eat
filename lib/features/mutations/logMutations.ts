import { deleteFoodLogEntry, updateFoodLogEntry } from '@/actions/log-actions';
import { FoodEntry } from '@/types';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

export function updateLogFoodItemMutationOptions(foodEntry: FoodEntry) {
	return mutationOptions({
		mutationKey: ['updateLogFoodItemMtn', foodEntry],
		mutationFn: (fe: FoodEntry) => updateFoodLogEntry(fe),
		onSuccess: (res) => {
			toast.success(res.message);
		},
		onError: (res) => {
			toast.error(res.message);
		}
	});
}

export function deleteLogFoodItemMutationOptions(id: string) {
	return mutationOptions({
		mutationKey: ['deleteLogFoodItemMtn', id],
		mutationFn: (fiId: string) => deleteFoodLogEntry(fiId),
		onSuccess: (res) => {
			toast.success(res.message);
		},
		onError: (res) => {
			toast.error(res.message);
		}
	});
}

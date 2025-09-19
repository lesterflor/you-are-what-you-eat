import {
	addKnownCaloriesBurned,
	deleteFoodLogEntry,
	updateFoodLogEntry,
	updateLogWithOrder
} from '@/actions/log-actions';
import { FoodEntry } from '@/types';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

export function addLogFoodItemMutationOptions(logFoodItem: FoodEntry) {
	return mutationOptions({
		mutationKey: ['addLogFoodItemMtn', logFoodItem],
		mutationFn: (fe: FoodEntry) => updateLogWithOrder([fe]),
		onSuccess: (res) => {
			toast.success(res.message);
		},
		onError: (res) => {
			toast.error(res.message);
		}
	});
}

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

export function logCaloriesBurnedMutationOptions() {
	return mutationOptions({
		mutationKey: ['logCaloriesBurnedMtn'],
		mutationFn: (cls: number) => addKnownCaloriesBurned(cls),
		onSuccess: (res) => {
			toast.success(res.message);
		},
		onError: (res) => {
			toast.error(res.message);
		}
	});
}

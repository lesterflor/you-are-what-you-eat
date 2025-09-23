import { logActivity } from '@/actions/activity-log-actions';
import {
	addKnownCaloriesBurned,
	deleteFoodLogEntry,
	updateFoodLogEntry,
	updateLogWithOrder
} from '@/actions/log-actions';
import { getQueryClient } from '@/components/query-provider';
import { ActivityItem, FoodEntry } from '@/types';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
	getCurrentActivityLogQueryOptions,
	getCurrentLogQueryOptions,
	getLogRemainderQueryOptions
} from '../queries/logQueries';

const query = getQueryClient();

export function addLogFoodItemMutationOptions(logFoodItem: FoodEntry) {
	return mutationOptions({
		mutationKey: ['addLogFoodItemMtn', logFoodItem],
		mutationFn: (fe: FoodEntry) => updateLogWithOrder([fe]),
		onSuccess: (res) => {
			query.invalidateQueries({
				queryKey: getCurrentLogQueryOptions().queryKey
			});

			// invalidate remainders
			query.invalidateQueries({
				queryKey: getLogRemainderQueryOptions().queryKey
			});

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
			// invalidate the log list
			query.invalidateQueries({
				queryKey: getCurrentLogQueryOptions().queryKey
			});

			// invalidate remainders
			query.invalidateQueries({
				queryKey: getLogRemainderQueryOptions().queryKey
			});

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
		onSuccess: async (res) => {
			// invalidate the log list
			await query.invalidateQueries({
				queryKey: getCurrentLogQueryOptions().queryKey
			});

			// invalidate remainders
			await query.invalidateQueries({
				queryKey: getLogRemainderQueryOptions().queryKey
			});

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
			// tanstack
			query.invalidateQueries({
				queryKey: getCurrentLogQueryOptions().queryKey
			});

			// invalidate remainders
			query.invalidateQueries({
				queryKey: getLogRemainderQueryOptions().queryKey
			});

			toast.success(res.message);
		},
		onError: (res) => {
			toast.error(res.message);
		}
	});
}

export function logActivityMutationOptions() {
	return mutationOptions({
		mutationKey: ['logActivityMtn'],
		mutationFn: (activityData: ActivityItem) => logActivity(activityData),
		onSuccess: () => {
			// invalidate log
			query.invalidateQueries({
				queryKey: getCurrentActivityLogQueryOptions().queryKey
			});
		},
		onError: (res) => {
			toast.error(res.message);
		}
	});
}

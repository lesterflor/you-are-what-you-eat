import {
	createDish,
	deleteDish,
	updateDish
} from '@/actions/prepared-dish-actions';
import { GetPreparedDish, PreparedDish } from '@/types';
import { mutationOptions } from '@tanstack/react-query';
import { toast } from 'sonner';

export function deleteDishMutation() {
	return mutationOptions({
		mutationFn: (dishId: string) => deleteDish(dishId),
		mutationKey: ['mutateDeleteDish'],
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		}
	});
}

export function updateDishMutation() {
	return mutationOptions({
		mutationFn: (dish: GetPreparedDish) => updateDish(dish),
		mutationKey: ['mutateUpdateDish'],
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		}
	});
}

export function createDishMutation() {
	return mutationOptions({
		mutationFn: (dish: PreparedDish) => createDish(dish),
		mutationKey: ['mutateCreateDish'],
		onSuccess: (res) => {
			if (res.success) {
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		}
	});
}

export type DishUpdateMutationResponse =
	| {
			success: boolean;
			message: string;
			data: {
				id: string;
				createdAt: Date;
				updatedAt: Date;
				userId: string;
				name: string;
				description: string | null;
				sharedUsers: string[];
				foodItems: {
					id: string;
					name: string;
					category: string;
					description: string | null;
					numServings: number;
					image: string | null;
					carbGrams: number;
					fatGrams: number;
					proteinGrams: number;
					calories: number;
					eatenAt: Date;
				}[];
			};
	  }
	| {
			success: boolean;
			message: any;
			data?: undefined;
	  };

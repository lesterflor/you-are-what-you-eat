import { createAppSlice } from '@/lib/createAppSlice';
import { GetFoodItem, RxFoodItem } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

export interface FoodUpdateSliceState {
	value: RxFoodItem;
	status: 'idle' | 'updated' | 'added' | 'deleted';
	message: string;
}

const initialState: FoodUpdateSliceState = {
	value: {
		id: '',
		createdAt: '',
		name: '',
		category: '',
		carbGrams: 0,
		fatGrams: 0,
		proteinGrams: 0,
		calories: 0,
		description: '',
		servingSize: 0,
		userId: ''
	},
	status: 'idle',
	message: ''
};

export const foodUpdateSlice = createAppSlice({
	name: 'foodUpdate',
	initialState,
	reducers: (create) => ({
		updateFood: create.reducer((state, action: PayloadAction<RxFoodItem>) => {
			const {
				name,
				calories,
				description,
				servingSize,
				category,
				fatGrams,
				carbGrams,
				proteinGrams
			} = action.payload;

			state.value = action.payload;
			state.status = 'updated';
			state.message = `You updated ${action.payload.name} with data: 
			Name: ${name}
			Calories per serving: ${calories}
			Description: ${description}
			Serving size: ${servingSize}
			Category: ${category}
			Fat: ${fatGrams} g
			Carbohydrates: ${carbGrams} g
			Protein: ${proteinGrams} g`;
		}),
		addFood: create.reducer((state, action: PayloadAction<RxFoodItem>) => {
			state.status = 'added';
			state.value = action.payload;
			state.message = `You added a new food item, ${action.payload.name}`;
		}),
		deleteFood: create.reducer((state, action: PayloadAction<RxFoodItem>) => {
			state.status = 'deleted';
			state.value = action.payload;
			state.message = `You deleted the food item, ${action.payload.name}`;
		})
	}),
	selectors: {
		selectFoodUpdateData: (state) => state.value,
		selectFoodUpdateStatus: (state) => state.status,
		selectFoodUpdateMsg: (state) => state.message
	}
});

export const { updateFood, addFood, deleteFood } = foodUpdateSlice.actions;

export const {
	selectFoodUpdateData,
	selectFoodUpdateStatus,
	selectFoodUpdateMsg
} = foodUpdateSlice.selectors;

export function generateRxFoodItemSchema(data: GetFoodItem): RxFoodItem {
	const {
		id,
		createdAt,
		name,
		category,
		carbGrams,
		fatGrams,
		proteinGrams,
		calories,
		description,
		servingSize,
		userId
	} = data;

	return {
		id,
		createdAt: format(createdAt, 'PPP h:mm:ss a'),
		name,
		category,
		carbGrams,
		fatGrams,
		proteinGrams,
		calories,
		description,
		servingSize,
		userId
	};
}

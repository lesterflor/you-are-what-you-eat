import { createAppSlice } from '@/lib/createAppSlice';
import { GetFoodItem, RxFoodItem } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';
import { format } from 'date-fns';

export interface FoodUpdateSliceState {
	value: RxFoodItem;
	status: 'idle' | 'updated' | 'added' | 'deleted';
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
	status: 'idle'
};

export const foodUpdateSlice = createAppSlice({
	name: 'foodUpdate',
	initialState,
	reducers: (create) => ({
		updateFood: create.reducer((state, action: PayloadAction<RxFoodItem>) => {
			state.value = action.payload;
			state.status = 'updated';
		}),
		addFood: create.reducer((state, action: PayloadAction<RxFoodItem>) => {
			state.status = 'added';
			state.value = action.payload;
		}),
		deleteFood: create.reducer((state, action: PayloadAction<RxFoodItem>) => {
			state.status = 'deleted';
			state.value = action.payload;
		})
	}),
	selectors: {
		selectFoodUpdateData: (counter) => counter.value,
		selectFoodUpdateStatus: (counter) => counter.status
	}
});

export const { updateFood, addFood, deleteFood } = foodUpdateSlice.actions;

export const { selectFoodUpdateData, selectFoodUpdateStatus } =
	foodUpdateSlice.selectors;

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

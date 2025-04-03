import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FoodUpdateSliceState {
	value: {
		name: string;
		servings: number;
		time: string;
	};
	status: 'idle' | 'updated';
}

const initialState: FoodUpdateSliceState = {
	value: { time: '', name: '', servings: 0 },
	status: 'idle'
};

export const foodUpdateSlice = createAppSlice({
	name: 'foodUpdate',
	initialState,
	reducers: (create) => ({
		updateFood: create.reducer(
			(state, action: PayloadAction<{ name: string; servings: number }>) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					time: dateString,
					servings: action.payload.servings,
					name: action.payload.name
				};
				state.status = 'updated';
			}
		)
	}),
	selectors: {
		selectFoodUpdateData: (counter) => counter.value,
		selectFoodUpdateStatus: (counter) => counter.status
	}
});

export const { updateFood } = foodUpdateSlice.actions;

export const { selectFoodUpdateData, selectFoodUpdateStatus } =
	foodUpdateSlice.selectors;

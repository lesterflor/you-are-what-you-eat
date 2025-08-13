import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FoodLogSliceProps {
	listItems: string;
}

export interface FoodLogSlice {
	value: FoodLogSliceProps;
	status: 'idle' | 'added';
	message: string;
}

const initialState: FoodLogSlice = {
	value: { listItems: '' },
	status: 'idle',
	message: ''
};

export const foodLogSlice = createAppSlice({
	name: 'foodLogSlice',
	initialState,
	reducers: (create) => ({
		logFoodState: create.reducer(
			(state, action: PayloadAction<FoodLogSliceProps>) => {
				const list = JSON.parse(action.payload.listItems);

				state.status = 'added';
				state.value = action.payload;
				state.message = `Food ${list.length === 1 ? 'item' : 'items'} logged`;
			}
		)
	}),
	selectors: {
		selectFoodLogData: (state) => state.value,
		selectFoodLogStatus: (state) => state.status,
		selectFoodLogMessage: (state) => state.message
	}
});

export const { logFoodState } = foodLogSlice.actions;

export const { selectFoodLogData, selectFoodLogStatus, selectFoodLogMessage } =
	foodLogSlice.selectors;

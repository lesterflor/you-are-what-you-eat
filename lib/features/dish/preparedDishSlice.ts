import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PreparedDishSliceProps {
	id: string;
	name: string;
	description: string;
}

export interface PreparedDishSliceState {
	value: PreparedDishSliceProps;
	status: 'idle' | 'added' | 'deleted' | 'updated' | 'cleared' | 'logged';
}

const initialState: PreparedDishSliceState = {
	value: { id: '', name: '', description: '' },
	status: 'idle'
};

export const preparedDishSlice = createAppSlice({
	name: 'preparedDish',
	initialState,
	reducers: (create) => ({
		addDish: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'added';
			}
		),
		updateDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'updated';
			}
		),
		deleteDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'deleted';
			}
		),
		logDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'logged';
			}
		),
		clearItems: create.reducer((state) => {
			state.value = { id: '', name: '', description: '' };
			state.status = 'cleared';
		})
	}),
	selectors: {
		selectPreparedDishData: (state) => state.value,
		selectPreparedDishStatus: (state) => state.status
	}
});

export const {
	addDish,
	updateDishState,
	deleteDishState,
	clearItems,
	logDishState
} = preparedDishSlice.actions;

export const { selectPreparedDishData, selectPreparedDishStatus } =
	preparedDishSlice.selectors;

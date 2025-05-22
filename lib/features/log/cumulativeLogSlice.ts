import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export type LogCumulativeType = {
	calories: number;
	carbs: number;
	fat: number;
	protein: number;
	totalGrams: number;
};

export interface LogCumulativeSliceState {
	value: LogCumulativeType;
	status: 'idle' | 'logged' | 'updated' | 'deleted' | 'expended calories';
}

const initialState: LogCumulativeSliceState = {
	value: {
		calories: 0,
		carbs: 0,
		fat: 0,
		protein: 0,
		totalGrams: 0
	},
	status: 'idle'
};

export const logCumulativeSlice = createAppSlice({
	name: 'logCumulative',
	initialState,
	reducers: (create) => ({
		added: create.reducer((state, action: PayloadAction<LogCumulativeType>) => {
			state.value = action.payload;
			state.status = 'logged';
		}),
		reset: create.reducer((state) => {
			state.value = initialState.value;
			state.status = 'idle';
		})
	}),
	selectors: {
		selectLogData: (state) => state.value,
		selectLogStatus: (state) => state.status
	}
});

export const { added, reset } = logCumulativeSlice.actions;

export const { selectLogData, selectLogStatus } = logCumulativeSlice.selectors;

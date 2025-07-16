import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface WaterLogSliceProps {
	glasses: number;
	ounces: number;
	litres: number;
}

export interface WaterLogSlice {
	value: WaterLogSliceProps;
	status: 'idle' | 'updated';
	message: string;
}

const initialState: WaterLogSlice = {
	value: { glasses: 0, ounces: 0, litres: 0 },
	status: 'idle',
	message: ''
};

export const waterLogSlice = createAppSlice({
	name: 'waterLogSlice',
	initialState,
	reducers: (create) => ({
		updatedWater: create.reducer(
			(state, action: PayloadAction<WaterLogSliceProps>) => {
				state.status = 'updated';
				state.value = {
					glasses: action.payload.glasses,
					ounces: action.payload.ounces,
					litres: action.payload.litres
				};
				state.message = `Water consumption updated to ${
					action.payload.glasses
				} ${action.payload.glasses === 1 ? 'glass' : 'glasses'}`;
			}
		)
	}),
	selectors: {
		selectWaterLogData: (state) => state.value,
		selectWaterLogStatus: (state) => state.status
	}
});

export const { updatedWater } = waterLogSlice.actions;

export const { selectWaterLogData, selectWaterLogStatus } =
	waterLogSlice.selectors;

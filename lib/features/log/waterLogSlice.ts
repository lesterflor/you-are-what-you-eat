import { todaysWaterConsumed } from '@/actions/log-actions';
import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export interface WaterLogSliceProps {
	glasses: number;
	ounces: number;
	litres: number;
}

export interface WaterLogSlice {
	value: WaterLogSliceProps;
	status: 'idle' | 'updated' | 'initial' | 'updating' | 'failed';
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
		setInitialAmount: create.reducer(
			(state, action: PayloadAction<WaterLogSliceProps>) => {
				state.status = 'initial';
				state.value = {
					glasses: action.payload.glasses,
					ounces: action.payload.ounces,
					litres: action.payload.litres
				};
				state.message = `You currently have consumed ${
					action.payload.glasses
				} ${action.payload.glasses === 1 ? 'glass' : 'glasses'}`;
			}
		),

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
		),

		updateWaterAsync: create.asyncThunk(
			async (amount: number, { rejectWithValue }) => {
				const res = await todaysWaterConsumed(amount);

				if (res.success && res.data) {
					return {
						data: {
							...res.data,
							createdAt: res.data.createdAt.toString(),
							updatedAt: res.data.updatedAt.toString()
						},
						message: res.message
					};
				}

				return rejectWithValue({ error: res.message });
			},
			{
				pending: (state) => {
					state.status = 'updating';
				},
				fulfilled: (state, action) => {
					const { glasses, ounces, litres } = action.payload.data;

					state.status = 'updated';
					state.value = {
						glasses,
						ounces,
						litres
					};
					state.message = action.payload.message;

					toast.success(action.payload.message);
				},
				rejected: (state, action) => {
					const errMsg = (action.payload as { error: string }).error;
					state.status = 'failed';
					state.message = errMsg;

					toast.error(errMsg);
				}
			}
		)
	}),
	selectors: {
		selectWaterLogData: (state) => state.value,
		selectWaterLogStatus: (state) => state.status,
		selectWaterLogMessage: (state) => state.message
	}
});

export const { updatedWater, setInitialAmount, updateWaterAsync } =
	waterLogSlice.actions;

export const {
	selectWaterLogData,
	selectWaterLogStatus,
	selectWaterLogMessage
} = waterLogSlice.selectors;

import { createAppSlice } from '@/lib/createAppSlice';
import { BaseMetabolicRateType } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserDataSliceProps {
	bmrData: string;
	caloricData?: string;
}

export interface UserDataSlice {
	value: UserDataSliceProps;
	status: 'idle' | 'updated';
	message: string;
}

const initialState: UserDataSlice = {
	value: {
		bmrData: JSON.stringify({
			weight: 0,
			id: '',
			createdAt: new Date(),
			updatedAt: new Date(),
			userId: '',
			weightUnit: '',
			height: 0,
			heightUnit: '',
			age: 0,
			sex: '',
			bmr: 0
		}),
		caloricData: JSON.stringify({
			consumed: 0,
			remaining: 0,
			burned: 0
		})
	},
	status: 'idle',
	message: ''
};

export const userDataSlice = createAppSlice({
	name: 'userDataSlice',
	initialState,
	reducers: (create) => ({
		updateData: create.reducer(
			(state, action: PayloadAction<UserDataSliceProps>) => {
				const serialized: BaseMetabolicRateType = JSON.parse(
					action.payload.bmrData
				);

				const {
					weight,
					id,
					createdAt,
					updatedAt,
					userId,
					weightUnit,
					height,
					heightUnit,
					age,
					sex,
					bmr
				} = serialized;

				const { consumed, remaining, burned } = JSON.parse(
					action.payload.caloricData ?? ''
				);

				state.status = 'updated';
				state.value = {
					bmrData: JSON.stringify({
						weight,
						id,
						createdAt,
						updatedAt,
						userId,
						weightUnit,
						height,
						heightUnit,
						age,
						sex,
						bmr
					}),
					caloricData: JSON.stringify({
						consumed,
						remaining,
						burned
					})
				};
				state.message = 'User data updated';
			}
		)
	}),
	selectors: {
		selectUserData: (state) => state.value,
		selectUserDataStatus: (state) => state.status
	}
});

export const { updateData } = userDataSlice.actions;

export const { selectUserData, selectUserDataStatus } = userDataSlice.selectors;

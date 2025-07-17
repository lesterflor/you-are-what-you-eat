import { createAppSlice } from '@/lib/createAppSlice';
import { BaseMetabolicRateType } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserDataSliceProps {
	data: string;
}

export interface UserDataSlice {
	value: UserDataSliceProps;
	status: 'idle' | 'updated';
	message: string;
}

const initialState: UserDataSlice = {
	value: {
		data: JSON.stringify({
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
					action.payload.data
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

				state.status = 'updated';
				state.value = {
					data: JSON.stringify({
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

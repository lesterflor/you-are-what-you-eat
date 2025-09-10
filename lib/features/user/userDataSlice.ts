import { addKnownCaloriesBurned, getCurrentLog } from '@/actions/log-actions';
import { createAppSlice } from '@/lib/createAppSlice';
import { BaseMetabolicRateType } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface UserDataSliceProps {
	bmrData: string;
	caloricData?: string;
}

export interface UserDataSlice {
	value: UserDataSliceProps;
	status: 'idle' | 'updated' | 'loggingCalories' | 'loggedCalories' | 'failed';
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
					bmr = 0
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
		),
		caloriesUpdatedAsync: create.asyncThunk(
			async (calories: number) => {
				// prop object
				const returnObj = {
					consumed: 0,
					remaining: 0,
					burned: 0,
					cumulativeRemaining: 0
				};

				// action to add new known calories burned
				const resCals = await addKnownCaloriesBurned(calories);

				if (resCals.success && resCals.data) {
					returnObj.burned = resCals.data.calories;
				}

				// action to get total and remaining
				const resTotRemain = await getCurrentLog();

				if (resTotRemain?.success && resTotRemain?.data) {
					returnObj.remaining = resTotRemain?.data.remainingCalories ?? 0;
					returnObj.consumed = resTotRemain?.data.totalCalories ?? 0;
					returnObj.cumulativeRemaining =
						Math.sign(returnObj.remaining) === -1
							? returnObj.remaining + -returnObj.burned
							: returnObj.remaining + returnObj.burned;
				}

				return returnObj;
			},
			{
				pending: (state) => {
					state.status = 'loggingCalories';
				},
				fulfilled: (state, action) => {
					state.status = 'loggedCalories';
					state.value = {
						...state.value,
						caloricData: JSON.stringify(action.payload)
					};
					state.message = `You've burnt ${action.payload.burned} ${
						action.payload.burned === 1 ? 'calorie' : 'calories'
					} today.`;
				},
				rejected: (state) => {
					state.status = 'failed';
					state.message = 'Failed to log calories';
				}
			}
		)
	}),
	selectors: {
		selectUserData: (state) => state.value,
		selectUserDataStatus: (state) => state.status,
		selectUserDataMessage: (state) => state.message
	}
});

export const { updateData, caloriesUpdatedAsync } = userDataSlice.actions;

export const { selectUserData, selectUserDataStatus, selectUserDataMessage } =
	userDataSlice.selectors;

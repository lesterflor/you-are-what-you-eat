import { createDailyLog } from '@/actions/log-actions';
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
	log: string;
	status:
		| 'idle'
		| 'logged'
		| 'updated'
		| 'deleted'
		| 'expended calories'
		| 'fetching'
		| 'fetched'
		| 'initial'
		| 'failed';
}

const initialState: LogCumulativeSliceState = {
	value: {
		calories: 0,
		carbs: 0,
		fat: 0,
		protein: 0,
		totalGrams: 0
	},
	log: '',
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
		}),
		setInitialLog: create.reducer((state, action: PayloadAction<string>) => {
			state.log = action.payload;
			state.status = 'initial';
		}),
		fetchInitialLog: create.asyncThunk(
			async () => {
				const res = await createDailyLog();

				if (res?.success && res.data) {
					return {
						...res.data,
						createdAt: res.data && res.data.createdAt?.toString(),
						updatedAt: res.data && res.data.updatedAt?.toString(),
						foodItems:
							res.data &&
							res.data.foodItems?.map((fi) => ({
								...fi,
								eatenAt: fi.eatenAt.toString()
							})),
						knownCaloriesBurned: res.data.knownCaloriesBurned?.map((kc) => ({
							...kc
						})),
						logRemainder: res.data.logRemainder?.map((lr) => ({
							...lr
						})),
						user: res.data.user && {
							...res.data.user,
							createdAt: res.data.user.createdAt.toString(),
							updatedAt: res.data.user.updatedAt.toString(),
							BaseMetabolicRate: res.data.user.BaseMetabolicRate?.map(
								(bmr) => ({
									...bmr
								})
							)
						}
					};
				}

				return null;
			},
			{
				pending: (state) => {
					state.status = 'fetching';
				},
				fulfilled: (state, action: PayloadAction<any>) => {
					state.log = JSON.stringify(action.payload);
					state.status = 'fetched';
				},
				rejected: (state) => {
					state.status = 'failed';
				}
			}
		)
	}),
	selectors: {
		selectLogData: (state) => state.value,
		selectLogStatus: (state) => state.status,
		selectCurrentLog: (state) => state.log
	}
});

export const { added, reset, fetchInitialLog, setInitialLog } =
	logCumulativeSlice.actions;

export const { selectLogData, selectLogStatus, selectCurrentLog } =
	logCumulativeSlice.selectors;

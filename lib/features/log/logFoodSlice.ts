import { updateLogWithOrder } from '@/actions/log-actions';
import { createAppSlice } from '@/lib/createAppSlice';
import { FoodEntry } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FoodItemsState {
	id: string;
	name: string;
	category: string;
	description: string | null;
	numServings: number;
	image: string | null;
	carbGrams: number;
	fatGrams: number;
	proteinGrams: number;
	calories: number;
	eatenAt: string;
}

export interface LogFoodSliceState {
	value: {
		name: string;
		servings: number;
		time: string;
		caloriesExpended: number;
		message: string;
	};
	log?: {
		id?: string;
		createdAt?: string;
		updatedAt?: string;
		userId?: string;
		foodItems?: FoodItemsState[];
	};
	status:
		| 'idle'
		| 'added'
		| 'updated'
		| 'deleted'
		| 'expended calories'
		| 'adding'
		| 'failed';
}

const initialState: LogFoodSliceState = {
	value: {
		name: '',
		servings: 0,
		time: '',
		caloriesExpended: 0,
		message: ''
	},
	log: undefined,
	status: 'idle'
};

// If you are not using async thunks you can use the standalone `createSlice`.
export const logFoodSlice = createAppSlice({
	name: 'logFood',
	// `createSlice` will infer the state type from the `initialState` argument
	initialState,
	// The `reducers` field lets us define reducers and generate associated actions
	reducers: (create) => ({
		added: create.reducer(
			(state, action: PayloadAction<{ name: string; servings: number }>) => {
				// Redux Toolkit allows us to write "mutating" logic in reducers. It
				// doesn't actually mutate the state because it uses the Immer library,
				// which detects changes to a "draft state" and produces a brand new
				// immutable state based off those changes
				//state.value += 1;
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: action.payload.name,
					servings: action.payload.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended,
					message: `You logged ${action.payload.servings} ${
						action.payload.servings === 1 ? 'serving' : 'servings'
					} of ${action.payload.name}`
				};
				state.status = 'added';
			}
		),

		updated: create.reducer(
			(state, action: PayloadAction<{ name: string; servings: number }>) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: action.payload.name,
					servings: action.payload.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended,
					message: `You updated the serving of ${action.payload.name} to ${action.payload.servings}`
				};
				state.status = 'updated';
			}
		),

		deleted: create.reducer(
			(
				state,
				action: PayloadAction<{
					name: string;
					servings: number;
					id?: string;
				}>
			) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: action.payload.name,
					servings: action.payload.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended,
					message: `You deleted your logged food item, ${action.payload.name}`
				};
				state.status = 'deleted';

				if (state.log) {
					state.log.foodItems = state.log.foodItems?.filter(
						(item) => item.id !== action.payload.id
					);
				}
			}
		),
		expendedCaloriesUpdated: create.reducer(
			(state, action: PayloadAction<number>) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: state.value.name,
					servings: state.value.servings,
					time: dateString,
					caloriesExpended:
						(state.value.caloriesExpended ?? 0) + action.payload,
					message: `You added ${action.payload} ${
						action.payload === 1 ? 'calorie' : 'calories'
					} to your expended calories`
				};
				state.status = 'expended calories';
			}
		),
		reset: create.reducer((state) => {
			state.value = {
				name: '',
				servings: 0,
				time: '',
				caloriesExpended: 0,
				message: ''
			};
			state.status = 'idle';
		}),

		// The function below is called a thunk and allows us to perform async logic. It
		// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
		// will call the thunk with the `dispatch` function as the first argument. Async
		// code can then be executed and other actions can be dispatched. Thunks are
		// typically used to make async requests.
		logFoodAsync: create.asyncThunk(
			async ({
				logFoodItem,
				name,
				servings
			}: {
				logFoodItem: FoodEntry;
				name: string;
				servings: number;
			}) => {
				const res = await updateLogWithOrder([logFoodItem]);
				// The value we return becomes the `fulfilled` action payload
				return {
					log: {
						...res.data,
						createdAt: res.data && res.data.createdAt?.toString(),
						updatedAt: res.data && res.data.updatedAt?.toString(),
						foodItems:
							res.data &&
							res.data.foodItems?.map((fi) => ({
								...fi,
								eatenAt: fi.eatenAt.toString()
							}))
					},
					name,
					servings
				};
			},
			{
				pending: (state) => {
					state.status = 'adding';
				},
				fulfilled: (state, action) => {
					state.status = 'added';

					if (action.payload) {
						const dateString = `${new Date().getTime()}`;
						state.value = {
							name: action.payload.name,
							servings: action.payload.servings,
							time: dateString,
							caloriesExpended: state.value.caloriesExpended,
							message: `You logged ${action.payload.servings} ${
								action.payload.servings === 1 ? 'serving' : 'servings'
							} of ${action.payload.name}`
						};

						const serLog = {
							...action.payload.log
						};

						state.log = serLog;
					}
				},
				rejected: (state) => {
					state.status = 'failed';
					state.value = {
						...state.value,
						message: 'Failed to add food to your log'
					};
				}
			}
		)
	}),
	// You can define your selectors here. These selectors receive the slice
	// state as their first argument.
	selectors: {
		selectData: (counter) => counter.value,
		selectStatus: (counter) => counter.status,
		selectLog: (state) => state.log
	}
});

// Action creators are generated for each case reducer function.
export const {
	added,
	updated,
	deleted,
	expendedCaloriesUpdated,
	logFoodAsync,
	reset
} = logFoodSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectData, selectStatus, selectLog } = logFoodSlice.selectors;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
// 	(amount: number): AppThunk =>
// 	(dispatch, getState) => {
// 		const currentValue = selectCount(getState());

// 		if (currentValue % 2 === 1 || currentValue % 2 === -1) {
// 			dispatch(incrementByAmount(amount));
// 		}
// 	};

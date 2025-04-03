import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
//import { fetchCount } from "./counterAPI";

export interface LogFoodSliceState {
	value: {
		name: string;
		servings: number;
		time: string;
		caloriesExpended: number;
	};
	status:
		| 'idle'
		| 'added'
		| 'updated'
		| 'deleted'
		| 'expended-calories-updated';
}

const initialState: LogFoodSliceState = {
	value: {
		name: '',
		servings: 0,
		time: '',
		caloriesExpended: 0
	},
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
					caloriesExpended: state.value.caloriesExpended
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
					caloriesExpended: state.value.caloriesExpended
				};
				state.status = 'updated';
			}
		),

		deleted: create.reducer(
			(state, action: PayloadAction<{ name: string; servings: number }>) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: action.payload.name,
					servings: action.payload.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended
				};
				state.status = 'deleted';
			}
		),
		expendedCaloriesUpdated: create.reducer(
			(state, action: PayloadAction<number>) => {
				const dateString = `${new Date().getTime()}`;
				state.value = {
					name: state.value.name,
					servings: state.value.servings,
					time: dateString,
					caloriesExpended: state.value.caloriesExpended + action.payload
				};
				state.status = 'expended-calories-updated';
			}
		)
		// Use the `PayloadAction` type to declare the contents of `action.payload`
		// incrementByAmount: create.reducer(
		// 	(state, action: PayloadAction<number>) => {
		// 		state.value += action.payload;
		// 	}
		// )
		// The function below is called a thunk and allows us to perform async logic. It
		// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
		// will call the thunk with the `dispatch` function as the first argument. Async
		// code can then be executed and other actions can be dispatched. Thunks are
		// typically used to make async requests.
		// incrementAsync: create.asyncThunk(
		//   async (amount: number) => {
		//     const response = await fetchCount(amount);
		//     // The value we return becomes the `fulfilled` action payload
		//     return response.data;
		//   },
		//   {
		//     pending: (state) => {
		//       state.status = "loading";
		//     },
		//     fulfilled: (state, action) => {
		//       state.status = "idle";
		//       state.value += action.payload;
		//     },
		//     rejected: (state) => {
		//       state.status = "failed";
		//     },
		//   },
		// ),
	}),
	// You can define your selectors here. These selectors receive the slice
	// state as their first argument.
	selectors: {
		selectData: (counter) => counter.value,
		selectStatus: (counter) => counter.status
	}
});

// Action creators are generated for each case reducer function.
export const { added, updated, deleted, expendedCaloriesUpdated } =
	logFoodSlice.actions;

// Selectors returned by `slice.selectors` take the root state as their first argument.
export const { selectData, selectStatus } = logFoodSlice.selectors;

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

import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { combineSlices, configureStore } from '@reduxjs/toolkit';
import { preparedDishSlice } from './features/dish/preparedDishSlice';
import { bookmarkFoodSlice } from './features/food/bookmarkSlice';
import { foodSearchSlice } from './features/food/foodSearchSlice';
import { foodUpdateSlice } from './features/food/foodUpdateSlice';
import { grocerySlice } from './features/grocery/grocerySlice';
import { logCumulativeSlice } from './features/log/cumulativeLogSlice';
import { foodLogSlice } from './features/log/foodLogSlice';
import { logFoodSlice } from './features/log/logFoodSlice';
import { waterLogSlice } from './features/log/waterLogSlice';
import { noteUpdateSlice } from './features/notes/noteUpdateSlice';
import { userDataSlice } from './features/user/userDataSlice';
import { imageSlice } from './image/imageSlice';

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
const rootReducer = combineSlices(
	logFoodSlice,
	foodSearchSlice,
	foodUpdateSlice,
	noteUpdateSlice,
	grocerySlice,
	preparedDishSlice,
	logCumulativeSlice,
	imageSlice,
	waterLogSlice,
	userDataSlice,
	bookmarkFoodSlice,
	foodLogSlice
);
// Infer the `RootState` type from the root reducer
export type RootState = ReturnType<typeof rootReducer>;

// `makeStore` encapsulates the store configuration to allow
// creating unique store instances, which is particularly important for
// server-side rendering (SSR) scenarios. In SSR, separate store instances
// are needed for each request to prevent cross-request state pollution.
export const makeStore = () => {
	return configureStore({
		reducer: rootReducer
		// Adding the api middleware enables caching, invalidation, polling,
		// and other useful features of `rtk-query`.
		// middleware: (getDefaultMiddleware) => {
		//   return getDefaultMiddleware().concat(quotesApiSlice.middleware);
		// },
	});
};

// Infer the return type of `makeStore`
export type AppStore = ReturnType<typeof makeStore>;
// Infer the `AppDispatch` type from the store itself
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
	ThunkReturnType,
	RootState,
	unknown,
	Action
>;

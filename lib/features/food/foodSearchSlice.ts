import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FoodSearchSliceState {
	value: { term?: string; category?: string; user?: string; time: string };
	status: 'idle' | 'input' | 'category' | 'user' | 'all';
}

const initialState: FoodSearchSliceState = {
	value: { time: '' },
	status: 'idle'
};

export const foodSearchSlice = createAppSlice({
	name: 'foodSearch',
	initialState,
	reducers: (create) => ({
		inputSearch: create.reducer((state, action: PayloadAction<string>) => {
			const dateString = `${new Date().getTime()}`;
			state.value = {
				time: dateString,
				term: action.payload
			};
			state.status = 'input';
		}),

		categorySearch: create.reducer((state, action: PayloadAction<string>) => {
			const dateString = `${new Date().getTime()}`;
			state.value = {
				time: dateString,
				category: action.payload
			};
			state.status = 'category';
		}),

		userSearch: create.reducer((state, action: PayloadAction<string>) => {
			const dateString = `${new Date().getTime()}`;
			state.value = {
				time: dateString,
				user: action.payload
			};
			state.status = 'user';
		}),
		allSearch: create.reducer((state) => {
			const dateString = `${new Date().getTime()}`;
			state.value = {
				time: dateString
			};
			state.status = 'all';
		})
	}),
	selectors: {
		selectFoodSearchData: (counter) => counter.value,
		selectFoodSearchStatus: (counter) => counter.status
	}
});

export const { inputSearch, categorySearch, userSearch, allSearch } =
	foodSearchSlice.actions;

export const { selectFoodSearchData, selectFoodSearchStatus } =
	foodSearchSlice.selectors;

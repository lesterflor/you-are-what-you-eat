import { getFoodCategoryConstants } from '@/components/food-items/food-categories';
import { createAppSlice } from '@/lib/createAppSlice';
import { GetUser } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface FoodSearchSliceState {
	value: { term?: string; category?: string; user?: string; message: string };
	status: 'idle' | 'input' | 'category' | 'user' | 'all';
}

const initialState: FoodSearchSliceState = {
	value: { message: '' },
	status: 'idle'
};

export const foodSearchSlice = createAppSlice({
	name: 'foodSearch',
	initialState,
	reducers: (create) => ({
		inputSearch: create.reducer((state, action: PayloadAction<string>) => {
			state.value = {
				term: action.payload,
				message: `You searched for ${action.payload}`
			};
			state.status = 'input';
		}),

		categorySearch: create.reducer((state, action: PayloadAction<string>) => {
			state.value = {
				category: action.payload,
				message: `You searched for ${getFoodCategoryConstants(
					action.payload
				)} items`
			};
			state.status = 'category';
		}),

		userSearch: create.reducer((state, action: PayloadAction<string>) => {
			const usr: GetUser = JSON.parse(action.payload);

			state.value = {
				user: usr.id,
				message: `You searched for items added by ${usr.name}`
			};
			state.status = 'user';
		}),
		allSearch: create.reducer((state) => {
			state.value = {
				message: `You searched for all items`
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

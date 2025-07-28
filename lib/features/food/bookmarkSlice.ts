import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface BookmarkFoodSliceState {
	value: { id: string; name: string };
	status: 'idle' | 'add' | 'remove';
}

const initialState: BookmarkFoodSliceState = {
	value: { id: '', name: '' },
	status: 'idle'
};

export const bookmarkFoodSlice = createAppSlice({
	name: 'bookmarkFood',
	initialState,
	reducers: (create) => ({
		addBookmark: create.reducer((state, action: PayloadAction<string>) => {
			state.value = JSON.parse(action.payload);
			state.status = 'add';
		}),
		removeBookmark: create.reducer((state, action: PayloadAction<string>) => {
			state.value = JSON.parse(action.payload);
			state.status = 'remove';
		})
	}),
	selectors: {
		selectBookmarkFoodData: (state) => state.value,
		selectBookmarkFoodStatus: (state) => state.status
	}
});

export const { addBookmark, removeBookmark } = bookmarkFoodSlice.actions;

export const { selectBookmarkFoodData, selectBookmarkFoodStatus } =
	bookmarkFoodSlice.selectors;

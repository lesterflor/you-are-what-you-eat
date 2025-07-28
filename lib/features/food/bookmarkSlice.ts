import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface BookmarkFoodSliceState {
	value: { id: string; name: string };
	status: 'idle' | 'add' | 'remove';
	message: string;
}

const initialState: BookmarkFoodSliceState = {
	value: { id: '', name: '' },
	status: 'idle',
	message: ''
};

export const bookmarkFoodSlice = createAppSlice({
	name: 'bookmarkFood',
	initialState,
	reducers: (create) => ({
		addBookmark: create.reducer((state, action: PayloadAction<string>) => {
			const data = JSON.parse(action.payload);
			state.value = data;
			state.status = 'add';
			state.message = `You bookmarked ${data.name}`;
		}),
		removeBookmark: create.reducer((state, action: PayloadAction<string>) => {
			const data = JSON.parse(action.payload);
			state.value = data;
			state.status = 'remove';
			state.message = `You removed the bookmark to ${data.name}`;
		})
	}),
	selectors: {
		selectBookmarkFoodData: (state) => state.value,
		selectBookmarkFoodStatus: (state) => state.status,
		selectBookmarkFoodMessage: (state) => state.message
	}
});

export const { addBookmark, removeBookmark } = bookmarkFoodSlice.actions;

export const {
	selectBookmarkFoodData,
	selectBookmarkFoodStatus,
	selectBookmarkFoodMessage
} = bookmarkFoodSlice.selectors;

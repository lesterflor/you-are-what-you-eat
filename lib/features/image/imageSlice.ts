import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export type SupportedImageTypes = 'dish' | 'foodItem';

export interface ImageSliceProps {
	id: string;
	url: string;
	alt: string;
	type: SupportedImageTypes | '';
	parentId?: string;
}

export interface ImageSliceState {
	value: ImageSliceProps;
	status: 'idle' | 'added' | 'deleted' | 'updated' | 'cleared' | 'adding';
}

const initialState: ImageSliceState = {
	value: { id: '', url: '', alt: '', type: '' },
	status: 'idle'
};

export const imageSlice = createAppSlice({
	name: 'imagesData',
	initialState,
	reducers: (create) => ({
		addImageState: create.reducer(
			(state, action: PayloadAction<ImageSliceProps>) => {
				state.value = action.payload;
				state.status = 'added';
			}
		),
		deleteImageState: create.reducer(
			(state, action: PayloadAction<ImageSliceProps>) => {
				state.value = action.payload;
				state.status = 'deleted';
			}
		),
		addingImageState: create.reducer((state) => {
			state.status = 'adding';
		})
	}),
	selectors: {
		selectImageData: (state) => state.value,
		selectImageStatus: (state) => state.status
	}
});

export const { addImageState, deleteImageState, addingImageState } =
	imageSlice.actions;

export const { selectImageData, selectImageStatus } = imageSlice.selectors;

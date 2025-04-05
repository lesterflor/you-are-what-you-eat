import { createAppSlice } from '@/lib/createAppSlice';
import { truncate } from '@/lib/utils';
import type { PayloadAction } from '@reduxjs/toolkit';

export type NoteSliceData = {
	id: string;
	title: string;
	description: string;
};

export interface NoteUpdateSliceState {
	value: NoteSliceData;
	status: 'idle' | 'updated' | 'added' | 'deleted';
	message: string;
}

const initialState: NoteUpdateSliceState = {
	value: { id: '', title: '', description: '' },
	status: 'idle',
	message: ''
};

export const noteUpdateSlice = createAppSlice({
	name: 'noteUpdate',
	initialState,
	reducers: (create) => ({
		updateNote: create.reducer(
			(state, action: PayloadAction<NoteSliceData>) => {
				state.value = action.payload;
				state.status = 'updated';
				state.message = `You updated your note, ${truncate(
					action.payload.description,
					50
				)}`;
			}
		),
		deleteNote: create.reducer(
			(state, action: PayloadAction<NoteSliceData>) => {
				state.status = 'deleted';
				state.value = action.payload;
				state.message = `You deleted your note, ${truncate(
					action.payload.description,
					50
				)}`;
			}
		),
		addNote: create.reducer((state, action: PayloadAction<NoteSliceData>) => {
			state.status = 'added';
			state.value = action.payload;
			state.message = `You added a new note, ${truncate(
				action.payload.description,
				50
			)}`;
		})
	}),
	selectors: {
		selectNoteUpdateData: (state) => state.value,
		selectNoteUpdateStatus: (state) => state.status,
		selectNoteMsg: (state) => state.message
	}
});

export const { updateNote, addNote, deleteNote } = noteUpdateSlice.actions;

export const { selectNoteUpdateData, selectNoteUpdateStatus, selectNoteMsg } =
	noteUpdateSlice.selectors;

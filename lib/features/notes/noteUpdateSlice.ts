import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface NoteUpdateSliceState {
	value: {
		id: string;
		time: string;
	};
	status: 'idle' | 'updated';
}

const initialState: NoteUpdateSliceState = {
	value: { time: '', id: '' },
	status: 'idle'
};

export const noteUpdateSlice = createAppSlice({
	name: 'noteUpdate',
	initialState,
	reducers: (create) => ({
		updateNote: create.reducer((state, action: PayloadAction<string>) => {
			const dateString = `${new Date().getTime()}`;
			state.value = {
				time: dateString,
				id: action.payload
			};
			state.status = 'updated';
		})
	}),
	selectors: {
		selectNoteUpdateData: (counter) => counter.value,
		selectNoteUpdateStatus: (counter) => counter.status
	}
});

export const { updateNote } = noteUpdateSlice.actions;

export const { selectNoteUpdateData, selectNoteUpdateStatus } =
	noteUpdateSlice.selectors;

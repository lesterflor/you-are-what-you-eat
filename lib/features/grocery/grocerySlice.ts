import { createAppSlice } from '@/lib/createAppSlice';
import { GetGroceryItem, GetGroceryList, GetUser } from '@/types';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface GrocerySliceState {
	value: {
		id: string;
		info: string | null;
	};
	status:
		| 'idle'
		| 'updatedList'
		| 'addedList'
		| 'completedList'
		| 'addedItem'
		| 'deletedItem'
		| 'completedItem'
		| 'sharedList';
	message: string;
}

const initialState: GrocerySliceState = {
	value: { id: '', info: null },
	status: 'idle',
	message: ''
};

export const grocerySlice = createAppSlice({
	name: 'grocerySlice',
	initialState,
	reducers: (create) => ({
		updateGroceryListState: create.reducer(
			(state, action: PayloadAction<string>) => {
				const serialized: GetGroceryList = JSON.parse(action.payload);

				state.status = 'updatedList';
				state.value = { id: serialized.id, info: action.payload };
				state.message = 'You updated your grocery list';
			}
		),
		addGroceryListState: create.reducer(
			(state, action: PayloadAction<string>) => {
				const serialized: GetGroceryList = JSON.parse(action.payload);
				state.status = 'addedList';
				state.value = { id: serialized.id, info: action.payload };
				state.message = 'You added a new grocery list';
			}
		),
		completeGroceryListState: create.reducer(
			(state, action: PayloadAction<string>) => {
				const serialized: GetGroceryList = JSON.parse(action.payload);
				state.status = 'completedList';
				state.value = { id: serialized.id, info: action.payload };
				state.message = 'You completed a grocery list';
			}
		),
		addGroceryItemState: create.reducer(
			(state, action: PayloadAction<string>) => {
				const serialized: GetGroceryItem = JSON.parse(action.payload);
				state.status = 'addedItem';
				state.value = { id: serialized.id, info: action.payload };
				state.message = `You added ${serialized.qty} ${serialized.name} as a grocery item`;
			}
		),
		completeGroceryItemState: create.reducer(
			(state, action: PayloadAction<string>) => {
				const serialized: GetGroceryItem = JSON.parse(action.payload);
				state.status = 'completedItem';
				state.value = { id: serialized.id, info: action.payload };
				state.message = `You checked off ${serialized.qty} ${serialized.name} from your grocery list`;
			}
		),
		deleteGroceryItemState: create.reducer(
			(state, action: PayloadAction<string>) => {
				const serialized: GetGroceryItem = JSON.parse(action.payload);
				state.status = 'deletedItem';
				state.value = { id: serialized.id, info: action.payload };
				state.message = `You removed ${serialized.qty} ${serialized.name} from a grocery list`;
			}
		),
		shareGroceryListState: create.reducer(
			(state, action: PayloadAction<string>) => {
				const serialized: GetUser[] = JSON.parse(action.payload);
				state.status = 'sharedList';
				state.value = { id: state.value.id, info: action.payload };
				state.message =
					serialized.length > 0
						? `You shared a grocery list with ${serialized[0].name}`
						: '';
			}
		)
	}),
	selectors: {
		selectGroceryData: (state) => state.value,
		selectGroceryStatus: (state) => state.status,
		selectGroceryMsg: (state) => state.message
	}
});

export const {
	addGroceryListState,
	updateGroceryListState,
	completeGroceryListState,
	completeGroceryItemState,
	addGroceryItemState,
	deleteGroceryItemState,
	shareGroceryListState
} = grocerySlice.actions;

export const { selectGroceryData, selectGroceryStatus, selectGroceryMsg } =
	grocerySlice.selectors;

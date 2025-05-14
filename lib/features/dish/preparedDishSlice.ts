import { createAppSlice } from '@/lib/createAppSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

export interface PreparedDishSliceProps {
	id: string;
	name: string;
	description: string;
	dishList: string;
	checkedItem?: string;
}

export interface PreparedDishSliceState {
	value: PreparedDishSliceProps;
	status:
		| 'idle'
		| 'added'
		| 'deleted'
		| 'updated'
		| 'cleared'
		| 'logged'
		| 'checkedItem'
		| 'dishList';
}

const initialState: PreparedDishSliceState = {
	value: { id: '', name: '', description: '', dishList: '[]' },
	status: 'idle'
};

export const preparedDishSlice = createAppSlice({
	name: 'preparedDish',
	initialState,
	reducers: (create) => ({
		addDish: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'added';
			}
		),
		updateDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'updated';
			}
		),
		deleteDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'deleted';
			}
		),
		logDishState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'logged';
			}
		),

		setDishListState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				state.value = action.payload;
				state.status = 'dishList';
			}
		),

		setCheckedItemState: create.reducer(
			(state, action: PayloadAction<PreparedDishSliceProps>) => {
				const recItem = JSON.parse(action.payload.checkedItem!);
				const dishList = JSON.parse(state.value.dishList);
				const clone = [...dishList];

				let newData;

				if (recItem.add) {
					clone.push({ add: true, item: recItem.item });
					newData = clone;
				} else {
					newData = clone.filter(
						(lItem) =>
							recItem.item.id !== lItem.item.id &&
							recItem.item.eatenAt !== lItem.item.eatenAt
					);
				}

				//console.log('update: ', newData);

				state.value = { ...action.payload, dishList: JSON.stringify(newData) };
				state.status = 'checkedItem';
			}
		),
		clearItems: create.reducer((state) => {
			state.value = { id: '', name: '', description: '', dishList: '' };
			state.status = 'cleared';
		})
	}),
	selectors: {
		selectPreparedDishData: (state) => state.value,
		selectPreparedDishStatus: (state) => state.status
	}
});

export const {
	addDish,
	updateDishState,
	deleteDishState,
	clearItems,
	logDishState,
	setDishListState,
	setCheckedItemState
} = preparedDishSlice.actions;

export const { selectPreparedDishData, selectPreparedDishStatus } =
	preparedDishSlice.selectors;

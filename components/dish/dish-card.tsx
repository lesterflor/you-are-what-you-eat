'use client';

import {
	deleteDish,
	logDishItems,
	updateDish
} from '@/actions/prepared-dish-actions';
import {
	deleteDishState,
	logDishState,
	updateDishState
} from '@/lib/features/dish/preparedDishSlice';
import { useAppDispatch } from '@/lib/hooks';
import { GetFoodEntry, GetPreparedDish } from '@/types';
import { CookingPot, FilePenLine, ScrollText, X } from 'lucide-react';
import { useCallback, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardTitle
} from '../ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import DishFoodItem from './dish-food-item';

export default function DishCard({ dish }: { dish: GetPreparedDish }) {
	const dispatch = useAppDispatch();
	const [prepDish, setPrepDish] = useState<GetPreparedDish>(dish);
	const [items, setItems] = useState<GetFoodEntry[]>(dish.foodItems);
	const [isUpdating, setIsUpdating] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [loggingDish, setLoggingDish] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [dishProps, setDishProps] = useState<{
		name: string;
		description: string;
	}>({ name: prepDish.name, description: prepDish.description });

	const dispatchDishState = useCallback(() => {
		dispatch(
			updateDishState({
				id: prepDish.id,
				name: prepDish.name,
				description: prepDish.description
			})
		);
	}, [prepDish]);

	return (
		<Card>
			<CardTitle className='p-2 font-normal flex flex-row items-center gap-2 relative'>
				{isUpdating ? (
					<ImSpinner2 className='w-6 h-6 animate-spin' />
				) : (
					<CookingPot className='w-6 h-6' />
				)}
				<div>
					{isEditMode ? (
						<Input
							defaultValue={prepDish.name}
							onChange={(e) => {
								const upd = { ...dishProps };
								upd.name = e.target.value;
								setDishProps(upd);
							}}
						/>
					) : (
						<div>{prepDish.name}</div>
					)}
				</div>

				<div className='absolute top-0 right-0'>
					<Dialog>
						<DialogTrigger asChild>
							<Button
								size={'icon'}
								variant={'secondary'}>
								<X />
							</Button>
						</DialogTrigger>
						<DialogContent className='flex flex-col gap-4 items-center'>
							<DialogTitle>Confirm Delete</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete this dish? This action cannot be
								undone
							</DialogDescription>
							<Button
								disabled={isDeleting}
								onClick={async () => {
									setIsDeleting(true);
									const res = await deleteDish(prepDish.id);

									if (res.success && res.data) {
										toast.success(res.message);
										dispatch(
											deleteDishState({
												id: res.data.id,
												name: res.data.name,
												description: res.data.description ?? ''
											})
										);
									} else {
										toast.error(res.message);
									}

									setIsDeleting(false);
								}}>
								{isDeleting ? <ImSpinner2 className='animate-spin' /> : <X />}
								Delete
							</Button>
						</DialogContent>
					</Dialog>
				</div>
			</CardTitle>
			{dish.description && (
				<CardDescription className='p-2'>
					{isEditMode ? (
						<Textarea
							defaultValue={prepDish.description}
							placeholder={prepDish.description}
							onChange={(e) => {
								const upd = { ...dishProps };
								upd.description = e.target.value;
								setDishProps(upd);
							}}
						/>
					) : (
						<div>{prepDish.description}</div>
					)}
				</CardDescription>
			)}
			<CardContent className='flex flex-col gap-2 w-full px-2'>
				{items &&
					items.length > 0 &&
					items.map((item, indx) => (
						<DishFoodItem
							onDelete={async (item) => {
								setIsUpdating(true);

								const upd = { ...dish };

								const newList = upd.foodItems.filter(
									(dItem) =>
										dItem.id !== item.id && dItem.eatenAt !== item.eatenAt
								);

								upd.foodItems = newList;

								setPrepDish(upd);
								setItems(upd.foodItems);

								const res = await updateDish(upd);

								if (res.success) {
									toast.success(res.message);
									setPrepDish(res.data as GetPreparedDish);

									dispatchDishState();
								} else {
									toast.error(res.message);
								}

								setIsUpdating(false);
							}}
							onEdit={async (item) => {
								setIsUpdating(true);

								const upd = { ...dish };

								const editItem = upd.foodItems.find(
									(dItem) =>
										dItem.id === item.id && dItem.eatenAt === item.eatenAt
								);

								if (editItem) {
									Object.assign(editItem, item);
								}

								setPrepDish(upd);
								setItems(upd.foodItems);

								const res = await updateDish(upd);

								if (res.success) {
									toast.success(res.message);
									setPrepDish(res.data as GetPreparedDish);

									dispatchDishState();
								} else {
									toast.error(res.message);
								}

								setIsUpdating(false);
							}}
							key={`${item.id}-${item.eatenAt}`}
							indx={indx}
							item={item}
						/>
					))}
			</CardContent>
			<CardFooter className='px-2 flex flex-row items-center justify-between'>
				<div className='flex flex-row items-center gap-2'>
					<Button onClick={() => setIsEditMode(!isEditMode)}>
						{isEditMode ? 'Cancel' : 'Edit'}
					</Button>

					{isEditMode && (
						<Button
							disabled={isUpdating}
							onClick={async () => {
								setIsUpdating(true);
								const upd = { ...prepDish };
								upd.name = dishProps.name;
								upd.description = dishProps.description;

								const res = await updateDish(upd);

								if (res.success) {
									toast.success(res.message);

									setPrepDish(res.data as GetPreparedDish);

									dispatchDishState();
								} else {
									toast.error(res.message);
								}
								setIsEditMode(false);
								setIsUpdating(false);
							}}>
							{isUpdating ? (
								<ImSpinner2 className='animate-spin' />
							) : (
								<FilePenLine />
							)}
							Update
						</Button>
					)}
				</div>

				<Button
					disabled={loggingDish}
					onClick={async () => {
						setLoggingDish(true);
						const res = await logDishItems(prepDish);

						if (res.success) {
							toast.success(res.message);

							dispatch(
								logDishState({
									id: prepDish.id,
									name: prepDish.name,
									description: prepDish.description
								})
							);
						} else {
							toast.error(res.message);
						}

						setLoggingDish(false);
					}}>
					{loggingDish ? (
						<ImSpinner2 className='animate-spin' />
					) : (
						<ScrollText />
					)}
					Log Dish
				</Button>
			</CardFooter>
		</Card>
	);
}

'use client';

import {
	createDish,
	getAllDishesByUser,
	updateDish
} from '@/actions/prepared-dish-actions';
import {
	addDish,
	clearItems,
	selectPreparedDishData,
	selectPreparedDishStatus,
	updateDishState
} from '@/lib/features/dish/preparedDishSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { preparedDishSchema } from '@/lib/validators';
import { GetFoodEntry, GetPreparedDish, GetUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
	ControllerRenderProps,
	SubmitErrorHandler,
	SubmitHandler,
	useForm
} from 'react-hook-form';
import { ImSpinner2 } from 'react-icons/im';
import { TbHemisphereOff, TbHemispherePlus } from 'react-icons/tb';
import { toast } from 'sonner';
import { z } from 'zod';
import ShareListButton from '../grocery/share-list-button';
import SharedListAvatars from '../grocery/shared-list-avatars';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Textarea } from '../ui/textarea';
import DishCard from './dish-card';
import DishFoodItem from './dish-food-item';

export default function CreateDishForm({
	foodItems,
	onSuccess,
	onDishListChange
}: {
	foodItems: GetFoodEntry[];
	onSuccess?: () => void;
	onDishListChange?: (list: GetFoodEntry[]) => void;
}) {
	const { data: session } = useSession();
	const user = session?.user as GetUser;
	const dispatch = useAppDispatch();

	const [dishFoodItems, setDishFoodItems] = useState<GetFoodEntry[]>(foodItems);

	const form = useForm<z.infer<typeof preparedDishSchema>>({
		resolver: zodResolver(preparedDishSchema),
		defaultValues: {
			name: '',
			description: '',
			foodItems: [],
			userId: user.id
		}
	});

	const onError: SubmitErrorHandler<z.infer<typeof preparedDishSchema>> = (
		errors
	) => {
		console.log(JSON.stringify(errors));
	};

	const sendDish: SubmitHandler<z.infer<typeof preparedDishSchema>> = async (
		values
	) => {
		values.foodItems = dishFoodItems;

		const res = await createDish(values);

		if (res.success && res.data) {
			toast.success(res.message);
			onSuccess?.();

			dispatch(
				addDish({
					id: res.data.id,
					name: res.data.name,
					description: res.data.description ?? '',
					dishList: '[]'
				})
			);
		} else {
			toast.error(res.message);
		}
	};

	const preparedDishData = useAppSelector(selectPreparedDishData);
	const preparedDishStatus = useAppSelector(selectPreparedDishStatus);

	useEffect(() => {
		if (preparedDishStatus === 'checkedItem') {
			const theData = JSON.parse(preparedDishData.dishList);
			type SliceDataType = {
				add: boolean;
				item: GetFoodEntry;
			};
			const items = theData.map((it: SliceDataType) => it.item);
			setDishFoodItems(items);
		}
	}, [preparedDishData, preparedDishStatus]);

	useEffect(() => {
		onDishListChange?.(dishFoodItems);
	}, [dishFoodItems]);

	const [currentDishes, setCurrentDishes] = useState<GetPreparedDish[]>();
	const fetchDishes = async () => {
		const res = await getAllDishesByUser();

		if (res.success && res.data) {
			setCurrentDishes(res.data as GetPreparedDish[]);
		}
	};

	useEffect(() => {
		fetchDishes();
	}, []);

	const [updatingDish, setUpdatingDish] = useState(false);

	const addItemsToExistingList = async (dish: GetPreparedDish) => {
		setUpdatingDish(true);

		const clone = [...dish.foodItems];
		const merged = [...clone, ...dishFoodItems];

		dish.foodItems = merged;
		const res = await updateDish(dish);

		if (res.success && res.data) {
			toast.success(res.message);
			dispatch(
				updateDishState({
					id: res.data.id,
					name: res.data.name,
					description: res.data.description ?? '',
					dishList: '[]'
				})
			);
		} else {
			toast.error(res.message);
		}

		setUpdatingDish(false);
	};

	const [sharedUsers, setSharedUsers] = useState<string[]>([]);

	return (
		<div className='flex flex-col gap-2 items-center relative'>
			<div className='leading-tight text-sm'>
				Do you want to create a new dish from the {foodItems.length} selected{' '}
				{foodItems.length === 1 ? 'item' : 'items'}?
			</div>
			<ScrollArea className='w-full'>
				<div className='flex flex-col gap-2 max-h-[22vh]'>
					{dishFoodItems &&
						dishFoodItems.length > 0 &&
						dishFoodItems.map((item, indx) => (
							<DishFoodItem
								indx={indx}
								item={item}
								key={`${item.id}-${item.eatenAt}-${indx}`}
								readOnly={true}
							/>
						))}
				</div>
			</ScrollArea>

			<div className='flex flex-col gap-2 items-center pt-2'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(sendDish, onError)}>
						<div className='flex flex-row gap-2'>
							<div className='flex flex-col gap-2'>
								<div>
									<FormField
										name='name'
										control={form.control}
										render={({
											field
										}: {
											field: ControllerRenderProps<
												z.infer<typeof preparedDishSchema>,
												'name'
											>;
										}) => (
											<FormItem>
												<FormControl>
													<Input
														className='border-emerald-800'
														{...field}
														placeholder='enter a dish name'
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>

								<div>
									<FormField
										name='description'
										control={form.control}
										render={({
											field
										}: {
											field: ControllerRenderProps<
												z.infer<typeof preparedDishSchema>,
												'description'
											>;
										}) => (
											<FormItem>
												<FormControl>
													<Textarea
														className='border-emerald-800'
														{...field}
														placeholder='enter a description (optional)'
													/>
												</FormControl>
											</FormItem>
										)}
									/>
								</div>
							</div>

							<div className='flex flex-col items-center gap-2 justify-center'>
								{sharedUsers.length === 0 ? (
									<div className='flex flex-row items-center justify-center gap-2'>
										<ShareListButton
											iconMode={true}
											onSelect={async (userId) => {
												if (userId) {
													const upd = [...sharedUsers];
													upd.push(userId);
													setSharedUsers(upd);

													form.setValue('sharedUsers', [userId]);
												}
											}}
										/>
									</div>
								) : (
									<SharedListAvatars userIds={sharedUsers} />
								)}

								<Button
									className='w-20'
									size={'sm'}
									type='submit'
									disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? (
										<ImSpinner2 className='animate-spin' />
									) : (
										<TbHemispherePlus />
									)}
									Create
								</Button>

								<Button
									className='w-20'
									size={'sm'}
									onClick={(e) => {
										e.preventDefault();

										dispatch(clearItems());
									}}>
									<TbHemisphereOff />
									Clear
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</div>

			{currentDishes && currentDishes.length > 0 && (
				<div className='flex flex-col gap-2 pt-4'>
					<div className='text-sm leading-tight'>
						{`Or add ${
							foodItems.length === 1 ? 'it' : 'them'
						} to an existing dish?`}
					</div>
					<ScrollArea className='w-full'>
						<div className='flex flex-col gap-6 max-h-[24vh] pt-3'>
							{currentDishes.map((item) => (
								<div
									key={item.id}
									className='flex flex-col items-end gap-2 relative'>
									<DishCard
										dish={item}
										readOnly={true}
									/>
									<Button
										className='absolute -top-2 right-0 rounded-full'
										size={'icon'}
										disabled={updatingDish}
										onClick={() => addItemsToExistingList(item)}>
										{updatingDish ? (
											<ImSpinner2 className='animate-spin' />
										) : (
											<TbHemispherePlus />
										)}
									</Button>
								</div>
							))}
						</div>
					</ScrollArea>
				</div>
			)}
		</div>
	);
}

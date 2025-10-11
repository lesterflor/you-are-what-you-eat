'use client';

import {
	addDish,
	clearItems,
	selectPreparedDishData,
	selectPreparedDishStatus,
	updateDishState
} from '@/lib/features/dish/preparedDishSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
	createDishMutation,
	updateDishMutation
} from '@/lib/mutations/dishMutations';
import { getAllDishesByUserOptions } from '@/lib/queries/dishQueries';
import { preparedDishSchema } from '@/lib/validators';
import { GetFoodEntry, GetPreparedDish, GetUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
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

	const preparedDishData = useAppSelector(selectPreparedDishData);
	const preparedDishStatus = useAppSelector(selectPreparedDishStatus);

	const [sharedUsers, setSharedUsers] = useState<string[]>([]);
	const [dishFoodItems, setDishFoodItems] = useState<GetFoodEntry[]>(foodItems);

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

	const { mutate: createDishItem } = useMutation(createDishMutation());

	const sendDish: SubmitHandler<z.infer<typeof preparedDishSchema>> = async (
		values
	) => {
		values.foodItems = dishFoodItems;

		// tanstack mutate
		createDishItem(values, {
			onSuccess: (res) => {
				onSuccess?.();

				// redux
				dispatch(
					addDish({
						id: res.data?.id ?? '',
						name: res.data?.name ?? '',
						description: res.data?.description ?? '',
						dishList: '[]'
					})
				);
			}
		});
	};

	const { data: currentDishes } = useQuery(getAllDishesByUserOptions());

	const { isPending: updatePending, mutate: updateDishItem } = useMutation(
		updateDishMutation()
	);

	const addItemsToExistingList = (dish: GetPreparedDish) => {
		const clone = [...dish.foodItems];
		const merged = [...clone, ...dishFoodItems];

		dish.foodItems = merged;

		// tanstack mutation
		updateDishItem(dish, {
			onSuccess: (res) => {
				// redux
				dispatch(
					updateDishState({
						id: res.data?.id ?? '',
						name: res.data?.name ?? '',
						description: res.data?.description ?? '',
						dishList: '[]'
					})
				);
			}
		});
	};

	return (
		<div className='flex flex-col gap-2 items-center relative'>
			<h2 className='leading-tight text-sm self-start font-semibold'>
				Do you want to create a new dish from the {foodItems.length} selected{' '}
				{foodItems.length === 1 ? 'item' : 'items'}?
			</h2>
			<ScrollArea className='w-full'>
				<div className='flex flex-col justify-center gap-2 max-h-[22vh]'>
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
					<h2 className='text-sm leading-tight font-semibold'>
						{`Or add ${
							foodItems.length === 1 ? 'it' : 'them'
						} to an existing dish?`}
					</h2>
					<ScrollArea className='w-full'>
						<div className='flex flex-col gap-6 max-h-[24vh] items-start w-full pt-2'>
							{currentDishes.map((item) => (
								<div
									key={item.id}
									className='flex flex-col items-end gap-2 relative'>
									<DishCard
										dish={item as GetPreparedDish}
										readOnly={true}
									/>
									<Button
										className='absolute !flex-col !gap-0 !text-xs -top-2 right-0 rounded-full'
										size={'icon'}
										disabled={updatePending}
										onClick={() =>
											addItemsToExistingList(item as GetPreparedDish)
										}>
										{updatePending ? (
											<ImSpinner2 className='animate-spin' />
										) : (
											<>
												<TbHemispherePlus />
												Add
											</>
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

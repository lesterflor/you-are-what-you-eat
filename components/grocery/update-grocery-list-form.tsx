'use client';

import { updateGroceryList } from '@/actions/grocery-actions';
import { updateGroceryListState } from '@/lib/features/grocery/grocerySlice';
import { useAppDispatch } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { getGroceryListSchema } from '@/lib/validators';
import { GetGroceryItem, GetGroceryList, GroceryList } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SubmitErrorHandler, SubmitHandler, useForm } from 'react-hook-form';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { z } from 'zod';
import { Form } from '../ui/form';
import { ScrollArea } from '../ui/scroll-area';
import AddGroceryItem from './add-grocery-item';
import GroceryItemCard from './grocery-item-card';
import ShareListButton from './share-list-button';
import SharedListAvatars from './shared-list-avatars';

export default function UpdateGroceryListForm({
	list,
	onSuccess
}: {
	list: GetGroceryList;
	onSuccess?: (list: GroceryList) => void;
}) {
	const dispatch = useAppDispatch();

	const [groceryItems, setGroceryItems] = useState<GetGroceryItem[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [sharedUsers] = useState<string[]>(list.sharedUsers);

	useEffect(() => {
		if (list.groceryItems && list.groceryItems.length > 0) {
			setGroceryItems(list.groceryItems);
		}
	}, []);

	useEffect(() => {
		form.setValue('sharedUsers', sharedUsers);
	}, [sharedUsers]);

	const form = useForm<z.infer<typeof getGroceryListSchema>>({
		resolver: zodResolver(getGroceryListSchema),
		defaultValues: list
	});

	const onError: SubmitErrorHandler<z.infer<typeof getGroceryListSchema>> = (
		errors
	) => {
		toast.error(JSON.stringify(errors));
	};

	const onSubmit: SubmitHandler<z.infer<typeof getGroceryListSchema>> = async (
		values
	) => {
		setIsSubmitting(true);
		const res = await updateGroceryList(values);

		if (res.success && res.data) {
			toast.success(res.message);

			onSuccess?.(res.data as GroceryList);

			form.reset();

			//redux
			dispatch(updateGroceryListState(JSON.stringify(res.data)));
		} else {
			toast.error(res.message);
		}

		setIsSubmitting(false);
	};

	return (
		<div className='flex flex-col justify-between w-full h-auto gap-6 relative'>
			<div className='absolute -top-12 right-8'>
				{list.sharedUsers.length > 1 ? (
					<SharedListAvatars userIds={list.sharedUsers} />
				) : (
					<>
						{isSubmitting ? (
							<ImSpinner2 className='animate-spin opacity-25 w-6 h-6' />
						) : (
							<ShareListButton
								value={list.sharedUsers}
								onSelect={(userId) => {
									if (userId) {
										const update = [...sharedUsers];
										update.push(userId);
										//setSharedUsers(update);
										form.setValue('sharedUsers', update);
										onSubmit(form.getValues());
									}
								}}
							/>
						)}
					</>
				)}
			</div>

			<div className='w-full'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit, onError)}>
						<ScrollArea className={cn('w-full border-b-2 py-2 pr-3')}>
							<div className='flex flex-col gap-4 w-full max-h-[45vh]'>
								{groceryItems.length > 0 ? (
									groceryItems.map((item) => (
										<GroceryItemCard
											listId={list.id}
											enableRemove={true}
											displayOnly={true}
											key={item.id}
											item={item}
											onRemove={(item) => {
												const update = groceryItems.filter(
													(gr) => gr.id !== item.id
												);

												setGroceryItems(update);
											}}
										/>
									))
								) : (
									<div className='text-muted-foreground flex flex-row items-center gap-2 opacity-25'>
										<ShoppingCart className='w-10 h-10' /> no items
									</div>
								)}
							</div>
						</ScrollArea>
					</form>
				</Form>
			</div>

			<div className='flex flex-col items-stretch justify-center w-full'>
				<AddGroceryItem
					listId={list.id}
					onAdd={(item: GetGroceryItem) => {
						const update = [...groceryItems];
						update.push(item);

						setGroceryItems(update);
					}}
				/>
			</div>
		</div>
	);
}

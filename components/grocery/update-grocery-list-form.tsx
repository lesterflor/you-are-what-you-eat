'use client';

import { getGroceryListSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '../ui/form';
import { updateGroceryList } from '@/actions/grocery-actions';
import { GetGroceryItem, GetGroceryList, GroceryList } from '@/types';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { FaSpinner } from 'react-icons/fa';
import { ShoppingCart } from 'lucide-react';
import AddGroceryItem from './add-grocery-item';
import GroceryItemCard from './grocery-item-card';
import { BsFillCartCheckFill } from 'react-icons/bs';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';
import ShareListButton from './share-list-button';
import { useAppDispatch } from '@/lib/hooks';
import { updateGroceryListState } from '@/lib/features/grocery/grocerySlice';

export default function UpdateGroceryListForm({
	list,
	onSuccess
}: {
	list: GetGroceryList;
	onSuccess?: (list: GroceryList) => void;
}) {
	const dispatch = useAppDispatch();

	const [groceryItems, setGroceryItems] = useState<GetGroceryItem[]>([]);
	const [addMinified, setAddMinified] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [sharedUsers, setSharedUsers] = useState<string[]>(list.sharedUsers);

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
				<ShareListButton
					value={list.sharedUsers}
					onSelect={(userId) => {
						const update = [...sharedUsers];
						update.push(userId);
						setSharedUsers(update);
					}}
				/>
			</div>

			<div className='w-full'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<ScrollArea
							className={cn(
								'w-full portrait:h-[40vh] border-b-2 py-2 pr-3',
								addMinified && 'portrait:h-[60vh]'
							)}>
							<div className='flex flex-col gap-4 w-full'>
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
					onMinify={(minified) => {
						setAddMinified(minified);
					}}
				/>
				<div className='w-full mt-4'>
					<Button
						disabled={isSubmitting}
						onClick={(e) => {
							e.preventDefault();
							onSubmit(form.getValues());
						}}>
						{isSubmitting ? (
							<FaSpinner className='w-4 h-4 animate-spin' />
						) : (
							<BsFillCartCheckFill className='w-4 h-4' />
						)}
						{isSubmitting ? 'Updating...' : 'Update List'}
					</Button>
				</div>
			</div>
		</div>
	);
}

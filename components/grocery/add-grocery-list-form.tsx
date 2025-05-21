'use client';

import { createGroceryList } from '@/actions/grocery-actions';
import { addGroceryListState } from '@/lib/features/grocery/grocerySlice';
import { useAppDispatch } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { groceryListSchema } from '@/lib/validators';
import { GetGroceryItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BsFillCartCheckFill } from 'react-icons/bs';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form } from '../ui/form';
import { ScrollArea } from '../ui/scroll-area';
import AddGroceryItem from './add-grocery-item';
import GroceryItemCard from './grocery-item-card';
import ShareListButton from './share-list-button';
import SharedListAvatars from './shared-list-avatars';

export default function AddGroceryListForm({
	onSuccess
}: {
	onSuccess?: () => void;
}) {
	const dispatch = useAppDispatch();
	const [groceryItems, setGroceryItems] = useState<GetGroceryItem[]>([]);
	const [sharedUsers, setSharedUsers] = useState<string[]>([]);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		form.setValue('sharedUsers', sharedUsers);

		// // redux
		// dispatch(shareGroceryListState(JSON.stringify(sharedUsers)));
	}, [sharedUsers]);

	const form = useForm<z.infer<typeof groceryListSchema>>({
		resolver: zodResolver(groceryListSchema),
		defaultValues: {
			status: 'pending',
			sharedUsers: [],
			groceryItems: []
		}
	});

	const onSubmit: SubmitHandler<
		z.infer<typeof groceryListSchema>
	> = async () => {
		setIsSubmitting(true);

		const res = await createGroceryList(groceryItems, sharedUsers);

		if (res.success && res.data) {
			toast.success(res.message);

			// redux
			dispatch(addGroceryListState(JSON.stringify(res.data)));

			setTimeout(() => {
				onSuccess?.();
			}, 1000);

			form.reset();
		} else {
			toast.error(res.message);
		}

		setIsSubmitting(false);
	};

	const scrollRefIntoView = () => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({
				behavior: 'smooth',
				block: 'end',
				inline: 'nearest'
			});
		}
	};

	return (
		<div className='flex flex-col justify-between w-full h-auto gap-6 relative'>
			<div className='absolute -top-12 right-8'>
				{sharedUsers.length === 0 ? (
					<ShareListButton
						onSelect={(userId) => {
							if (userId) {
								const update = [...sharedUsers];
								update.push(userId);
								setSharedUsers(update);
							}
						}}
					/>
				) : (
					<SharedListAvatars userIds={sharedUsers} />
				)}
			</div>

			<div className='w-full'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)}>
						<ScrollArea className={cn('w-full border-b-2 py-2 pr-3')}>
							<div className='flex flex-col gap-4 w-full max-h-[45vh]'>
								{groceryItems.length > 0 ? (
									groceryItems.map((item) => (
										<GroceryItemCard
											enableRemove={true}
											displayOnly={true}
											key={item.id}
											item={item}
											onRemove={(item) => {
												const update = groceryItems.filter(
													(gr) => gr.id !== item.id
												);

												setGroceryItems(update);

												scrollRefIntoView();
											}}
											onChange={() => {
												scrollRefIntoView();
											}}
										/>
									))
								) : (
									<div className='text-muted-foreground flex flex-row items-center gap-2 opacity-25'>
										<ShoppingCart className='w-10 h-10' /> no items
									</div>
								)}
							</div>
							<div ref={scrollRef}></div>
						</ScrollArea>
					</form>
				</Form>
			</div>

			<div className='flex flex-col items-stretch justify-center w-full'>
				<AddGroceryItem
					onAdd={(item: GetGroceryItem) => {
						const update = [...groceryItems];
						update.push(item);

						setGroceryItems(update);
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
							<ImSpinner2 className='w-4 h-4 animate-spin' />
						) : (
							<BsFillCartCheckFill className='w-4 h-4' />
						)}
						Finish List
					</Button>
				</div>
			</div>
		</div>
	);
}

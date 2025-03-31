'use client';

import { groceryListSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { Form } from '../ui/form';
import { createGroceryList } from '@/actions/grocery-actions';
import { GetGroceryItem } from '@/types';
import { toast } from 'sonner';
import { useState } from 'react';
import { Button } from '../ui/button';
import { FaSpinner } from 'react-icons/fa';
import { Plus } from 'lucide-react';
import AddGroceryItem from './add-grocery-item';

export default function AddGroceryListForm({
	onSuccess
}: {
	onSuccess?: () => void;
}) {
	const [groceryItems, setGroceryItems] = useState<GetGroceryItem[]>([]);

	const form = useForm<z.infer<typeof groceryListSchema>>({
		resolver: zodResolver(groceryListSchema),
		defaultValues: {
			status: 'pending',
			groceryItems: []
		}
	});

	const onSubmit: SubmitHandler<
		z.infer<typeof groceryListSchema>
	> = async () => {
		const res = await createGroceryList(groceryItems);

		if (res.success) {
			toast(res.message);
			onSuccess?.();

			form.reset();
		} else {
			toast.error(res.message);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='flex flex-col gap-4'>
					{groceryItems.length > 0 ? (
						groceryItems.map((item) => <div key={item.id}>{item.name}</div>)
					) : (
						<div className='text-muted-foreground'>No items</div>
					)}

					<div>
						<AddGroceryItem
							onAdd={(item: GetGroceryItem) => {
								const update = [...groceryItems];
								update.push(item);

								setGroceryItems(update);
							}}
						/>
					</div>

					<div className='w-full mt-4'>
						<Button disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? (
								<FaSpinner className='w-4 h-4 animate-spin' />
							) : (
								<Plus className='w-4 h-4' />
							)}
							{form.formState.isSubmitting ? 'Creating...' : 'Create'}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}

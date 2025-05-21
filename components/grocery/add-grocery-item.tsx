'use client';

import { createGroceryItem } from '@/actions/grocery-actions';
import { addGroceryItemState } from '@/lib/features/grocery/grocerySlice';
import { useAppDispatch } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { groceryItemSchema } from '@/lib/validators';
import { GetGroceryItem } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { FaCartPlus } from 'react-icons/fa6';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export default function AddGroceryItem({
	onAdd,
	onMinify,
	listId
}: {
	onAdd: (item: GetGroceryItem) => void;
	onMinify?: (bool: boolean) => void;
	listId?: string;
}) {
	const dispatch = useAppDispatch();

	const [qty, setQty] = useState(1);
	const [minified, setMinified] = useState(false);

	useEffect(() => {
		if (qty <= 0) {
			setQty(1);
		}

		if (qty > 0) {
			form.setValue('qty', qty);
		}
	}, [qty]);

	useEffect(() => {
		onMinify?.(minified);
	}, [minified]);

	const form = useForm<z.infer<typeof groceryItemSchema>>({
		resolver: zodResolver(groceryItemSchema),
		defaultValues: {
			name: '',
			description: '',
			qty: 1,
			status: 'pending'
		}
	});

	const onSubmit: SubmitHandler<z.infer<typeof groceryItemSchema>> = async (
		values
	) => {
		if (listId) {
			values.groceryListId = listId;
		}

		const res = await createGroceryItem(values);

		if (res.success && res.data) {
			toast.success(res.message);
			onAdd(res.data);

			//redux
			dispatch(addGroceryItemState(JSON.stringify(res.data)));

			// reset fields
			form.reset();
			setQty(1);
			//setMinified(true);
		} else {
			toast.error(res.message);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<Card className={cn('p-0', minified && 'bg-transparent border-none')}>
					<CardHeader className={cn('relative p-0', minified && 'bg-none')}>
						<Button
							size='icon'
							onClick={(e) => {
								e.preventDefault();
								setMinified(!minified);
							}}
							className='absolute -top-4 -right-2 rounded-full w-8 h-8 p-2 z-30'>
							<FaCartPlus className='w-4 h-4' />
						</Button>
					</CardHeader>
					<CardContent
						className={cn(
							'p-3 py-2 relative overflow-hidden',
							minified && 'h-0 opacity-0'
						)}>
						<div className='w-full flex flex-col items-center justify-between'>
							<div className='flex flex-col gap-4 w-full'>
								<FormField
									name='name'
									control={form.control}
									render={({
										field
									}: {
										field: ControllerRenderProps<
											z.infer<typeof groceryItemSchema>,
											'name'
										>;
									}) => (
										<FormItem>
											<FormControl>
												<Input
													className='w-[80%]'
													{...field}
													placeholder='Item Name'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									name='description'
									control={form.control}
									render={({
										field
									}: {
										field: ControllerRenderProps<
											z.infer<typeof groceryItemSchema>,
											'description'
										>;
									}) => (
										<FormItem>
											<FormControl>
												<Textarea
													placeholder='Description (optional)'
													{...field}
													className='h-6 resize-none'
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className='flex flex-row justify-between items-end w-full pt-2'>
								<FormField
									name='qty'
									control={form.control}
									render={({
										field
									}: {
										field: ControllerRenderProps<
											z.infer<typeof groceryItemSchema>,
											'qty'
										>;
									}) => (
										<FormItem>
											<FormControl>
												<div className='flex flex-row items-center gap-1 w-auto justify-center'>
													<Button
														size='icon'
														variant='secondary'
														onClick={(e) => {
															e.preventDefault();
															setQty(qty - 1);
														}}>
														<ChevronLeft className='w-6 h-6' />
													</Button>
													<Input
														readOnly
														{...field}
														className='w-16 text-2xl text-center ring-0 focus:ring-0'
													/>
													<Button
														size='icon'
														variant='secondary'
														onClick={(e) => {
															e.preventDefault();
															setQty(qty + 1);
														}}>
														<ChevronRight className='w-6 h-6' />
													</Button>
												</div>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									className='w-24'
									disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? (
										<ImSpinner2 className='w-4 h-4 animate-spin' />
									) : (
										<FaCartPlus className='w-4 h-4' />
									)}
									Add Item
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</form>
		</Form>
	);
}

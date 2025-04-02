'use client';

import { GetGroceryItem } from '@/types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { FaCartPlus } from 'react-icons/fa6';
import { Button } from '../ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { createGroceryItem } from '@/actions/grocery-actions';
import { toast } from 'sonner';
import { FaSpinner } from 'react-icons/fa';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { groceryItemSchema } from '@/lib/validators';
import { zodResolver } from '@hookform/resolvers/zod';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '../ui/form';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { cn } from '@/lib/utils';

export default function AddGroceryItem({
	onAdd,
	onMinify,
	listId
}: {
	onAdd: (item: GetGroceryItem) => void;
	onMinify?: (bool: boolean) => void;
	listId?: string;
}) {
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
			groceryListId: listId ?? '',
			status: 'pending'
		}
	});

	const onSubmit: SubmitHandler<z.infer<typeof groceryItemSchema>> = async (
		values
	) => {
		const res = await createGroceryItem(values);

		if (res.success && res.data) {
			toast.success(res.message);
			onAdd(res.data);

			// reset fields
			form.reset();
			setQty(1);
			setMinified(true);
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
							className='absolute -top-4 right-0 rounded-full w-8 h-8 p-2 z-30'>
							<FaCartPlus className='w-4 h-4' />
						</Button>
					</CardHeader>
					<CardContent
						className={cn(
							'p-3 relative overflow-hidden',
							minified && 'h-0 opacity-0'
						)}>
						<div className='w-full flex flex-col items-center justify-between'>
							<div className='flex flex-col gap-1 w-full'>
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
											<FormLabel className='text-xs font-normal text-muted-foreground'>
												Item Name
											</FormLabel>
											<FormControl>
												<Input {...field} />
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
											<FormLabel className='text-xs font-normal text-muted-foreground'>
												Description (optional)
											</FormLabel>
											<FormControl>
												<Textarea {...field} />
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							<div className='flex flex-row justify-between items-end w-full'>
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
											<FormLabel className='text-xs font-normal text-muted-foreground'>
												Quantity
											</FormLabel>
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
														className='w-10 text-2xl text-center ring-0 focus:ring-0'
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
										<FaSpinner className='w-4 h-4 animate-spin' />
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

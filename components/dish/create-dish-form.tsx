'use client';

import { createDish } from '@/actions/prepared-dish-actions';
import { addDish, clearItems } from '@/lib/features/dish/preparedDishSlice';
import { useAppDispatch } from '@/lib/hooks';
import { preparedDishSchema } from '@/lib/validators';
import { GetFoodEntry, GetUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
	ControllerRenderProps,
	SubmitErrorHandler,
	SubmitHandler,
	useForm
} from 'react-hook-form';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { Form, FormControl, FormField, FormItem } from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export default function CreateDishForm({
	foodItems,
	onSuccess
}: {
	foodItems: GetFoodEntry[];
	onSuccess?: () => void;
}) {
	const { data: session } = useSession();
	const user = session?.user as GetUser;
	const dispatch = useAppDispatch();

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
		values.foodItems = foodItems;

		const res = await createDish(values);

		if (res.success && res.data) {
			toast.success(res.message);
			onSuccess?.();

			dispatch(
				addDish({
					id: res.data.id,
					name: res.data.name,
					description: res.data.description ?? '',
					dishList: ''
				})
			);
		} else {
			toast.error(res.message);
		}
	};

	return (
		<div className='flex flex-col gap-4 items-center'>
			<div>Do you want to create a dish from the selected items?</div>
			<div className='flex flex-col gap-2 items-center'>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(sendDish, onError)}>
						<div className='flex flex-col gap-4'>
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

							<div className='flex flex-row items-center justify-between w-full'>
								<Button
									type='submit'
									disabled={form.formState.isSubmitting}>
									{form.formState.isSubmitting ? (
										<ImSpinner2 className='animate-spin' />
									) : (
										<Plus />
									)}
									Create
								</Button>

								<Button
									onClick={(e) => {
										e.preventDefault();

										dispatch(clearItems());
									}}>
									Cancel
								</Button>
							</div>
						</div>
					</form>
				</Form>
			</div>
		</div>
	);
}

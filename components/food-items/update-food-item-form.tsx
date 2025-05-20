'use client';

import { updateFoodItem } from '@/actions/food-actions';
import CaloricGram from '@/lib/caloric-gram';
import {
	generateRxFoodItemSchema,
	updateFood
} from '@/lib/features/food/foodUpdateSlice';
import { useAppDispatch } from '@/lib/hooks';
import { getFoodItemSchema } from '@/lib/validators';
import { GetFoodItem, GetUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderIcon, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import {
	ControllerRenderProps,
	SubmitErrorHandler,
	SubmitHandler,
	useForm
} from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import NumberIncrementor from '../number-incrementor';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '../ui/form';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import FoodCategoryPicker from './food-categories';

export default function UpdateFoodItemForm({
	item,
	onSuccess
}: {
	item: GetFoodItem;
	onSuccess?: () => void;
}) {
	const dispatch = useAppDispatch();

	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const form = useForm<z.infer<typeof getFoodItemSchema>>({
		resolver: zodResolver(getFoodItemSchema),
		defaultValues: item
	});

	const onSubmit: SubmitHandler<z.infer<typeof getFoodItemSchema>> = async (
		values
	) => {
		const carbCal = CaloricGram(values.carbGrams, 'CARB').calories;
		const protCal = CaloricGram(values.proteinGrams, 'PROTEIN').calories;
		const fatCal = CaloricGram(values.fatGrams, 'FAT').calories;

		values.calories = carbCal + protCal + fatCal;

		if (user.id) {
			values.userId = user.id;
		}

		const res = await updateFoodItem(values);

		if (res.success && res.data) {
			toast.success(res.message);
			form.reset();
			onSuccess?.();

			dispatch(updateFood(generateRxFoodItemSchema(res.data as GetFoodItem)));
		} else {
			toast.error(res.message);
		}
	};

	const onError: SubmitErrorHandler<z.infer<typeof getFoodItemSchema>> = (
		errors
	) => {
		console.log(JSON.stringify(errors));
	};

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit, onError)}>
					<div className='flex flex-col gap-8 w-full'>
						<div className='flex flex-row gap-2 justify-between flex-wrap w-full'>
							<FormField
								name='name'
								control={form.control}
								render={({
									field
								}: {
									field: ControllerRenderProps<
										z.infer<typeof getFoodItemSchema>,
										'name'
									>;
								}) => (
									<FormItem className='w-64 space-y-0'>
										<FormLabel className='text-xs text-muted-foreground'>
											Name
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
										z.infer<typeof getFoodItemSchema>,
										'description'
									>;
								}) => (
									<FormItem className='w-64 space-y-0'>
										<FormLabel className='text-xs text-muted-foreground'>
											Description
										</FormLabel>
										<FormControl>
											<Textarea {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								name='category'
								control={form.control}
								render={() => (
									<FormItem className='space-y-0'>
										<FormLabel className='text-xs text-muted-foreground'>
											Category
										</FormLabel>
										<FormControl>
											<FoodCategoryPicker
												searchOnly={false}
												disableReduxDispatch={true}
												value={item.category}
												onSelect={(val) => {
													form.setValue('category', val);
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>

						<Card>
							<CardContent className='p-4'>
								<div className='w-full h-full flex flex-row flex-wrap items-center justify-center gap-4'>
									<FormField
										name='servingSize'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center'>
												<FormLabel className='text-xs text-muted-foreground'>
													Serving Size
												</FormLabel>
												<FormControl>
													<NumberIncrementor
														minValue={1}
														value={form.getValues('servingSize')}
														onChange={(val) => {
															form.setValue('servingSize', val);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name='carbGrams'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center'>
												<FormLabel className='text-xs text-muted-foreground'>
													Carbs in grams
												</FormLabel>
												<FormControl>
													<NumberIncrementor
														value={form.getValues('carbGrams')}
														onChange={(val) => {
															form.setValue('carbGrams', val);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name='proteinGrams'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center'>
												<FormLabel className='text-xs text-muted-foreground'>
													Protein in grams
												</FormLabel>
												<FormControl>
													<NumberIncrementor
														value={form.getValues('proteinGrams')}
														onChange={(val) => {
															form.setValue('proteinGrams', val);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name='fatGrams'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center'>
												<FormLabel className='text-xs text-muted-foreground'>
													Fat in grams
												</FormLabel>
												<FormControl>
													<NumberIncrementor
														value={form.getValues('fatGrams')}
														onChange={(val) => {
															form.setValue('fatGrams', val);
														}}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						<div className='flex flex-row items-end justify-end w-full'>
							<Button
								disabled={form.formState.isSubmitting}
								className='w-44 portrait:w-full'>
								{form.formState.isSubmitting ? (
									<LoaderIcon className='w-4 h-4 animate-spin' />
								) : (
									<Plus className='w-4 h-4' />
								)}
								{form.formState.isSubmitting ? 'Updating...' : 'Update'}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}

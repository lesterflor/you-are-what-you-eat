'use client';

import { toast } from 'sonner';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFoodItemSchema } from '@/lib/validators';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '../ui/form';
import { updateFoodItem } from '@/actions/food-actions';
import FoodCategoryPicker from './food-categories';
import NumberIncrementor from '../number-incrementor';
import CaloricGram from '@/lib/caloric-gram';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { LoaderIcon, Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { useSession } from 'next-auth/react';
import { GetFoodItem, GetUser } from '@/types';

export default function UpdateFoodItemForm({
	item,
	onSuccess
}: {
	item: GetFoodItem;
	onSuccess?: () => void;
}) {
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

		if (res.success) {
			toast(res.message);
			form.reset();
			onSuccess?.();
		} else {
			toast.error(res.message);
		}
	};

	return (
		<div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className='flex flex-col gap-8 w-full'>
						<div className='flex flex-row gap-2 justify-between flex-wrap w-full'>
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
									<FormItem className='w-64'>
										<FormLabel className='font-semibold'>Description</FormLabel>
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
									<FormItem>
										<FormLabel className='font-semibold'>Category</FormLabel>
										<FormControl>
											<FoodCategoryPicker
												value={form.getValues('category')}
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
												<FormLabel>Serving Size</FormLabel>
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
												<FormLabel>Carbs in grams</FormLabel>
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
												<FormLabel>Protein in grams</FormLabel>
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
												<FormLabel>Fat in grams</FormLabel>
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

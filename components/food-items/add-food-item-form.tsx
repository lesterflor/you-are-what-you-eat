'use client';

import { toast } from 'sonner';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { foodItemSchema } from '@/lib/validators';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '../ui/form';
import { addFoodItem } from '@/actions/food-actions';
import { Input } from '../ui/input';
import FoodCategoryPicker from './food-categories';
import NumberIncrementor from '../number-incrementor';
import CaloricGram from '@/lib/caloric-gram';
import { Button } from '../ui/button';

export default function AddFoodItemForm() {
	const form = useForm<z.infer<typeof foodItemSchema>>({
		resolver: zodResolver(foodItemSchema),
		defaultValues: {
			name: '',
			category: '',
			image: '',
			carbGrams: 0,
			fatGrams: 0,
			proteinGrams: 0,
			calories: 0
		}
	});

	const onSubmit: SubmitHandler<z.infer<typeof foodItemSchema>> = async (
		values
	) => {
		const carbCal = CaloricGram(values.carbGrams, 'CARB').calories;
		const protCal = CaloricGram(values.proteinGrams, 'PROTEIN').calories;
		const fatCal = CaloricGram(values.fatGrams, 'FAT').calories;

		form.setValue('calories', carbCal + protCal + fatCal);

		const res = await addFoodItem(values);

		if (res.success) {
			form.reset();
			toast(res.message);
		} else {
			toast.error(res.message);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='flex flex-col gap-4'>
					<FormField
						name='name'
						control={form.control}
						render={({
							field
						}: {
							field: ControllerRenderProps<
								z.infer<typeof foodItemSchema>,
								'name'
							>;
						}) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder='enter the name of the food item'
									/>
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
								<FormLabel>Category</FormLabel>
								<FormControl>
									<FoodCategoryPicker
										onSelect={(val) => {
											form.setValue('category', val);
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
							<FormItem>
								<FormLabel>Carbs in grams</FormLabel>
								<FormControl>
									<NumberIncrementor
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
							<FormItem>
								<FormLabel>Protein in grams</FormLabel>
								<FormControl>
									<NumberIncrementor
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
							<FormItem>
								<FormLabel>Fat in grams</FormLabel>
								<FormControl>
									<NumberIncrementor
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

				<div>
					<Button disabled={form.formState.isSubmitting}>
						{form.formState.isSubmitting ? 'Adding...' : 'Add'}
					</Button>
				</div>
			</form>
		</Form>
	);
}

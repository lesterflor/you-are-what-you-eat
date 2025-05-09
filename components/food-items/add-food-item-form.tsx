'use client';

import { addFoodItem } from '@/actions/food-actions';
import CaloricGram from '@/lib/caloric-gram';
import {
	addFood,
	generateRxFoodItemSchema
} from '@/lib/features/food/foodUpdateSlice';
import { useAppDispatch } from '@/lib/hooks';
import { foodItemSchema } from '@/lib/validators';
import { GetFoodItem, GetUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderIcon, Plus } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
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

export default function AddFoodItemForm({
	onSuccess
}: {
	onSuccess?: () => void;
}) {
	const dispatch = useAppDispatch();

	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const form = useForm<z.infer<typeof foodItemSchema>>({
		resolver: zodResolver(foodItemSchema),
		defaultValues: {
			name: '',
			category: '',
			image: '',
			carbGrams: 0,
			fatGrams: 0,
			proteinGrams: 0,
			calories: 0,
			servingSize: 1,
			description: '',
			userId: user && user.id ? user.id : ''
		}
	});

	const [hasSubmitted, setHasSubmitted] = useState(false);

	const onSubmit: SubmitHandler<z.infer<typeof foodItemSchema>> = async (
		values
	) => {
		const carbCal = CaloricGram(values.carbGrams, 'CARB').calories;
		const protCal = CaloricGram(values.proteinGrams, 'PROTEIN').calories;
		const fatCal = CaloricGram(values.fatGrams, 'FAT').calories;

		values.calories = carbCal + protCal + fatCal;

		if (user.id) {
			values.userId = user.id;
		}

		const res = await addFoodItem(values);

		if (res.success && res.data) {
			//redux
			dispatch(addFood(generateRxFoodItemSchema(res.data as GetFoodItem)));

			toast.success(res.message);
			form.reset();
			setHasSubmitted(true);
			onSuccess?.();
			//router.push('/foods');
		} else {
			toast.error(res.message);
		}
	};

	return (
		<div>
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className='ml-1'>
					<div className='flex flex-col gap-8 w-full'>
						<div className='flex flex-row gap-2 justify-between flex-wrap w-full'>
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
									<FormItem className='w-60 portrait:w-[70vw] space-y-0'>
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
										z.infer<typeof foodItemSchema>,
										'description'
									>;
								}) => (
									<FormItem className='w-60 portrait:w-[70vw] space-y-0'>
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
												suppressUser={true}
												value={hasSubmitted ? '' : form.getValues('category')}
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

						<Card className='px-0'>
							<CardContent className='px-0 py-4'>
								<div className='w-full h-full flex flex-row flex-wrap items-center justify-center gap-3'>
									<FormField
										name='servingSize'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center space-y-0'>
												<FormControl>
													<NumberIncrementor
														compactMode={false}
														minValue={1}
														value={
															hasSubmitted ? 1 : form.getValues('servingSize')
														}
														onChange={(val) => {
															form.setValue('servingSize', val);
														}}>
														<div className='text-xs text-muted-foreground'>
															Serving Size
														</div>
													</NumberIncrementor>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name='carbGrams'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center space-y-0'>
												<FormControl>
													<NumberIncrementor
														compactMode={false}
														value={
															hasSubmitted ? 0 : form.getValues('carbGrams')
														}
														onChange={(val) => {
															form.setValue('carbGrams', val);
														}}>
														<div className='text-xs text-muted-foreground'>
															Carbs in grams
														</div>
													</NumberIncrementor>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name='proteinGrams'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center space-y-0'>
												<FormControl>
													<NumberIncrementor
														compactMode={false}
														value={
															hasSubmitted ? 0 : form.getValues('proteinGrams')
														}
														onChange={(val) => {
															form.setValue('proteinGrams', val);
														}}>
														<div className='text-xs text-muted-foreground'>
															Protein in grams
														</div>
													</NumberIncrementor>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>

									<FormField
										name='fatGrams'
										control={form.control}
										render={() => (
											<FormItem className='flex flex-col items-center space-y-0'>
												<FormControl>
													<NumberIncrementor
														compactMode={false}
														value={
															hasSubmitted ? 0 : form.getValues('fatGrams')
														}
														onChange={(val) => {
															form.setValue('fatGrams', val);
														}}>
														<div className='text-xs text-muted-foreground'>
															Fat in grams
														</div>
													</NumberIncrementor>
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
								{form.formState.isSubmitting ? 'Adding...' : 'Add'}
							</Button>
						</div>
					</div>
				</form>
			</Form>
		</div>
	);
}

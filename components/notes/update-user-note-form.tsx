'use client';

import { getUserNoteSchema } from '@/lib/validators';
import { GetUserNote } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { ControllerRenderProps, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { Button } from '../ui/button';
import { FilePenLine } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { updateNote } from '@/actions/user-note-actions';
import { updateNote as updateReduxNote } from '@/lib/features/notes/noteUpdateSlice';
import { toast } from 'sonner';
import { useAppDispatch } from '@/lib/hooks';

export default function UpdateUserNoteForm({
	note,
	children,
	onSuccess
}: {
	note: GetUserNote;
	children?: React.ReactNode;
	onSuccess?: () => void;
}) {
	const dispatch = useAppDispatch();

	const form = useForm<z.infer<typeof getUserNoteSchema>>({
		resolver: zodResolver(getUserNoteSchema),
		defaultValues: note
	});

	const onSubmit: SubmitHandler<z.infer<typeof getUserNoteSchema>> = async (
		values
	) => {
		const res = await updateNote(values);

		if (res.success && res.data) {
			toast.success(res.message);
			onSuccess?.();

			dispatch(
				updateReduxNote({
					id: res.data.id,
					title: res.data.title ?? '',
					description: res.data.note
				})
			);
		} else {
			toast.error(res.message);
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='flex flex-col gap-4'>
					<FormField
						name='title'
						control={form.control}
						render={({
							field
						}: {
							field: ControllerRenderProps<
								z.infer<typeof getUserNoteSchema>,
								'title'
							>;
						}) => (
							<FormItem>
								<FormLabel>Title (optional)</FormLabel>
								<FormControl>
									<Input
										{...field}
										className='w-64'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						name='note'
						control={form.control}
						render={({
							field
						}: {
							field: ControllerRenderProps<
								z.infer<typeof getUserNoteSchema>,
								'note'
							>;
						}) => (
							<FormItem>
								<FormLabel>Note</FormLabel>
								<FormControl>
									<Textarea
										{...field}
										className='w-64 h-[100px]'
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<div className='w-full py-5 flex flex-row items-center justify-between'>
						<Button
							className='w-32'
							type='submit'
							disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? (
								<FaSpinner className='w-4 h-4 animate-spin' />
							) : (
								<FilePenLine className='w-4 h-4' />
							)}
							{form.formState.isSubmitting ? 'Updating...' : 'Update'}
						</Button>

						{children}
					</div>
				</div>
			</form>
		</Form>
	);
}

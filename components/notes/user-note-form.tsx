'use client';

import { userNoteSchema } from '@/lib/validators';
import { GetUser } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
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
import { Plus } from 'lucide-react';
import { FaSpinner } from 'react-icons/fa';
import { createNote } from '@/actions/user-note-actions';
import { toast } from 'sonner';
import { useAppDispatch } from '@/lib/hooks';
import { addNote } from '@/lib/features/notes/noteUpdateSlice';

export default function UserNoteForm({
	onSuccess
}: {
	onSuccess?: () => void;
}) {
	const dispatch = useAppDispatch();
	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const form = useForm<z.infer<typeof userNoteSchema>>({
		resolver: zodResolver(userNoteSchema),
		defaultValues: {
			title: '',
			note: '',
			userId: user.id ?? ''
		}
	});

	const onSubmit: SubmitHandler<z.infer<typeof userNoteSchema>> = async (
		values
	) => {
		const res = await createNote(values);

		if (res.success && res.data) {
			form.reset();
			toast.success(res.message);

			dispatch(
				addNote({
					id: res.data.id,
					title: res.data.title ?? '',
					description: res.data.note
				})
			);

			onSuccess?.();
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
								z.infer<typeof userNoteSchema>,
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
								z.infer<typeof userNoteSchema>,
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

					<div className='w-full py-5 flex flex-row items-end justify-end'>
						<Button
							className='w-44 portrait:w-full'
							type='submit'
							disabled={form.formState.isSubmitting}>
							{form.formState.isSubmitting ? (
								<FaSpinner className='w-4 h-4 animate-spin' />
							) : (
								<Plus className='w-4 h-4' />
							)}
							{form.formState.isSubmitting ? 'Adding...' : 'Add'}
						</Button>
					</div>
				</div>
			</form>
		</Form>
	);
}

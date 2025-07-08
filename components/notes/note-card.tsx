'use client';

import { deleteNote } from '@/actions/user-note-actions';
import { deleteNote as rxDeleteNote } from '@/lib/features/notes/noteUpdateSlice';
import { useAppDispatch } from '@/lib/hooks';
import { GetUserNote } from '@/types';
import { format } from 'date-fns';
import { Calendar, NotebookPenIcon, RefreshCwOff, X } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import UpdateUserNoteForm from './update-user-note-form';

export default function NoteCard({
	note,
	indx
}: {
	note: GetUserNote;
	indx: number;
}) {
	const dispatch = useAppDispatch();

	const [isDeleting, setIsDeleting] = useTransition();
	const [dialogOpen, setDialogOpen] = useState(false);
	const [isEditing, setIsEditing] = useState(false);

	const [fadeClass, setFadeClass] = useState(false);
	useEffect(() => {
		setTimeout(
			() => {
				setFadeClass(true);
			},
			indx === 0 ? 1 : indx * 100
		);
	}, []);

	const delNote = () => {
		setIsDeleting(async () => {
			const res = await deleteNote(note.id);

			if (res.success && res.data) {
				toast.success(res.message);

				dispatch(
					rxDeleteNote({
						id: res.data.id,
						title: res.data.title ?? '',
						description: res.data.note
					})
				);

				setDialogOpen(false);
			} else {
				toast.error(res.message);
			}
		});
	};

	return (
		<>
			<div
				className='rounded-md border-2 px-3 pb-6 pt-3 flex flex-col gap-4 transition-opacity opacity-0 duration-1000 select-none'
				style={{
					opacity: fadeClass ? 1 : 0
				}}>
				<div className='text-xs text-muted-foreground flex flex-row items-center gap-2'>
					<Calendar className='w-4 h-4' />
					{format(note.createdAt, 'eee PP h:mm a')}
				</div>

				{!isEditing ? (
					<>
						{note.title && (
							<div className='text-muted-foreground'>{note.title}</div>
						)}
						<div className='whitespace-pre-line'>{note.note}</div>
					</>
				) : (
					<>
						<UpdateUserNoteForm
							note={note}
							onSuccess={() => setIsEditing(false)}>
							<Button
								variant='secondary'
								onClick={() => {
									setIsEditing(false);
								}}>
								<RefreshCwOff className='w-4 h-4' />
								Cancel
							</Button>
						</UpdateUserNoteForm>
					</>
				)}

				<div className='w-full flex flex-row items-center justify-between'>
					<Button
						disabled={isEditing}
						onClick={() => {
							setIsEditing(true);
						}}>
						<NotebookPenIcon className='w-4 h-4' /> Edit
					</Button>
					<Dialog
						open={dialogOpen}
						onOpenChange={setDialogOpen}>
						<DialogTrigger asChild>
							<Button
								variant='secondary'
								disabled={isEditing}>
								<X className='w-4 h-4' /> Delete
							</Button>
						</DialogTrigger>
						<DialogContent className='text-center'>
							<DialogTitle>Confirm Delete</DialogTitle>
							<DialogDescription>
								Are you sure you want to delete? This action cannot be undone
							</DialogDescription>
							<div className='w-full flex flex-row justify-center'>
								<Button
									onClick={() => {
										delNote();
									}}
									className='w-24'
									disabled={isDeleting}>
									{isDeleting ? (
										<ImSpinner2 className='w-4 h-4 animate-spin' />
									) : (
										<X className='w-4 h-4' />
									)}
									{isDeleting ? 'Deleting...' : 'Delete'}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</div>
		</>
	);
}

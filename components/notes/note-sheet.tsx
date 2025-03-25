'use client';

import { NotebookPen } from 'lucide-react';
import { Button } from '../ui/button';
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetTitle,
	SheetTrigger
} from '../ui/sheet';
import UserNoteForm from './user-note-form';

import { ScrollArea } from '../ui/scroll-area';
import { useSession } from 'next-auth/react';
import { GetUser, GetUserNote } from '@/types';
import { useContext, useEffect, useState } from 'react';
import { getUserNotes } from '@/actions/user-note-actions';
import { NoteContext } from '@/contexts/note-context';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import NoteCard from './note-card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export default function NoteSheet() {
	const { data: session } = useSession();
	const user = session?.user as GetUser;
	const noteContext = useContext(NoteContext);

	const [notes, setNotes] = useState<GetUserNote[]>(user.userNotes);
	const [popOpen, setPopOpen] = useState(false);

	const getNotes = async () => {
		const res = await getUserNotes();

		if (res.success) {
			setNotes(res.data as GetUserNote[]);
		}
	};

	useEffect(() => {
		if (noteContext?.updated) {
			getNotes();
		}
	}, [noteContext]);

	useEffect(() => {
		getNotes();
	}, []);

	return (
		<Sheet>
			<SheetTrigger asChild>
				<Button>
					<NotebookPen className='w-4 h-4' /> Notes
				</Button>
			</SheetTrigger>
			<SheetContent
				side='left'
				className='portrait:max-w-[95vw] portrait:w-[95vw]'>
				<SheetDescription></SheetDescription>
				<SheetTitle className='flex flex-row items-center justify-between pr-8'>
					<div className='flex flex-row items-center gap-2'>
						<Avatar>
							<AvatarImage src={user.image} />
							<AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
						</Avatar>
						My Notes
					</div>

					<Popover
						open={popOpen}
						onOpenChange={setPopOpen}>
						<PopoverTrigger asChild>
							<Button>
								<NotebookPen className='w-4 h-4' /> New Note
							</Button>
						</PopoverTrigger>
						<PopoverContent>
							<UserNoteForm
								onSuccess={() => {
									setPopOpen(false);
								}}
							/>
						</PopoverContent>
					</Popover>
				</SheetTitle>

				<br />
				<ScrollArea className='w-full h-full portrait:h-[80vh]'>
					<div className='w-full flex flex-col gap-6'>
						{notes && notes.length > 0 ? (
							notes.map((item, indx) => (
								<NoteCard
									indx={indx}
									key={item.id}
									note={item}
								/>
							))
						) : (
							<div className='text-muted-foreground font-normal'>
								There are currently no notes
							</div>
						)}
					</div>
				</ScrollArea>
			</SheetContent>
		</Sheet>
	);
}

'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { GetUser, GetUserNote, UserNote } from '@/types';

export async function getUserNotes() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session) {
			throw new Error('User must be authenticated');
		}

		const notes = await prisma.userNote.findMany({
			where: {
				userId: user.id
			},
			orderBy: {
				createdAt: 'desc'
			}
		});

		if (!notes) {
			throw new Error('There was a problem fetching user notes');
		}

		return {
			success: true,
			message: 'success',
			data: notes
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function createNote(note: UserNote) {
	try {
		const session = await auth();
		//const user = session?.user as GetUser;

		if (!session) {
			throw new Error('User must be authenticated');
		}

		const newNote = await prisma.userNote.create({
			data: note
		});

		if (!newNote) {
			throw new Error('There was a problem creating the note');
		}

		return {
			success: true,
			message: 'Note created successfully',
			data: newNote
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function updateNote(note: GetUserNote) {
	try {
		const session = await auth();
		//const user = session?.user as GetUser;

		if (!session) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.userNote.findFirst({
			where: {
				id: note.id
			}
		});

		if (!existing) {
			throw new Error('The note was not found');
		}

		const updateNote = await prisma.userNote.update({
			where: {
				id: existing.id
			},
			data: {
				title: note.title,
				note: note.note
			}
		});

		if (!updateNote) {
			throw new Error('There was a problem updating the note');
		}

		return {
			success: true,
			message: 'Note updated successfully',
			data: updateNote
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function deleteNote(noteId: string) {
	try {
		const session = await auth();

		if (!session) {
			throw new Error('User must be authenticated');
		}

		const existing = await prisma.userNote.findFirst({
			where: {
				id: noteId
			}
		});

		if (!existing) {
			throw new Error('The note was not found');
		}

		const deleteNote = await prisma.userNote.delete({
			where: {
				id: existing.id
			}
		});

		if (!deleteNote) {
			throw new Error('There was a problem deleting the note');
		}

		return {
			success: true,
			message: 'Note deleted successfully',
			data: deleteNote
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function searchNotes(term: string) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session) {
			throw new Error('User must be authenticated');
		}

		const notes = await prisma.userNote.findMany({
			where: {
				userId: user.id,
				title: {
					contains: term,
					mode: 'insensitive'
				},
				note: {
					contains: term,
					mode: 'insensitive'
				}
			}
		});

		if (!notes) {
			throw new Error('The notes were not found');
		}

		return {
			success: true,
			message: 'success',
			data: notes
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

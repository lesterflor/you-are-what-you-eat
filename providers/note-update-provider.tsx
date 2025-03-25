'use client';

import { INoteContext, NoteContext } from '@/contexts/note-context';
import { useState } from 'react';

export default function NoteContextProvider({
	children
}: {
	children: React.ReactNode;
}) {
	const [isUpdated, setIsUpdated] = useState<INoteContext>({
		updated: false,
		isUpdated: (update: INoteContext) => setIsUpdated(update)
	});

	return (
		<NoteContext.Provider value={isUpdated}>{children}</NoteContext.Provider>
	);
}

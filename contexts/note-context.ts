'use client';

import { createContext } from 'react';

export interface INoteContext {
	updated: boolean;
	isUpdated?: (update: INoteContext) => void;
}

export const NoteContext = createContext<INoteContext | null>(null);

'use client';

import { createContext } from 'react';

export interface ILogUpdateContext {
	updated: boolean;
	isUpdated?: (update: ILogUpdateContext) => void;
}

export const LogUpdateContext = createContext<ILogUpdateContext | null>(null);

'use client';

import { ILogUpdateContext, LogUpdateContext } from '@/contexts/log-context';
import { useState } from 'react';

export default function LogContextProvider({
	children
}: {
	children: React.ReactNode;
}) {
	const [isUpdated, setIsUpdated] = useState<ILogUpdateContext>({
		updated: false,
		isUpdated: (update: ILogUpdateContext) => setIsUpdated(update)
	});

	return (
		<LogUpdateContext.Provider value={isUpdated}>
			{children}
		</LogUpdateContext.Provider>
	);
}

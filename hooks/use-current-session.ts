import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export type CurrentSessionType =
	| 'authenticated'
	| 'unauthenticated'
	| 'loading';

// This hook doesn't rely on the session provider
export const useCurrentSession = () => {
	const [session, setSession] = useState<Session | null>(null);
	const [status, setStatus] = useState<CurrentSessionType>('unauthenticated');
	const pathName = usePathname();

	const retrieveSession = useCallback(async () => {
		try {
			setStatus('loading');
			const sessionData = await getSession();

			if (sessionData) {
				setSession(sessionData);
				setStatus('authenticated');
				return;
			}

			setStatus('unauthenticated');
		} catch (error: unknown) {
			console.log(error);
			setStatus('unauthenticated');
			setSession(null);
		}
	}, []);

	useEffect(() => {
		retrieveSession();

		// use the pathname to force a re-render when the user navigates to a new page
	}, [retrieveSession, pathName]);

	return { session, status };
};

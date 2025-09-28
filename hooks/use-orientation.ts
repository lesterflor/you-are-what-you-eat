import { useEffect, useState } from 'react';

// Extend the ScreenOrientation type to include lock and unlock if missing
declare global {
	interface ScreenOrientation {
		lock(orientation: OrientationLockType): Promise<void>;
	}
}

export const useLocalOrientation = () => {
	const [orientationType, setOrientationType] =
		useState<OrientationType | null>(null);

	useEffect(() => {
		if (
			typeof screen === 'undefined' ||
			typeof window === 'undefined' ||
			!('orientation' in screen)
		) {
			return;
		}

		const trackOrientation = (event: Event) => {
			const newType =
				(event?.target as ScreenOrientation)?.type ??
				screen.orientation?.type ??
				null;
			setOrientationType(newType);
		};

		// Initialize on mount
		trackOrientation(new Event('init'));

		screen.orientation.addEventListener('change', trackOrientation);

		return () => {
			screen.orientation.removeEventListener('change', trackOrientation);
		};
	}, []);

	return {
		getOrientationType: () => orientationType,
		lockOrientation: async (type: OrientationLockType = 'portrait-primary') => {
			if (
				typeof screen === 'undefined' ||
				typeof window === 'undefined' ||
				!('orientation' in screen)
			) {
				return;
			}

			try {
				if ('orientation' in screen && 'lock' in screen.orientation) {
					await screen.orientation.lock(type);
					console.log(`Locked to ${type}`);
				} else {
					console.warn('Orientation lock not supported, using fallback.');
				}
			} catch (err) {
				console.warn('Failed to lock orientation:', err);
			}
		},
		unlockOrientation: () => screen.orientation.unlock()
	};
};

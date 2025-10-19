'use client';

import { subscribeUser, unsubscribeUser } from '@/actions/pwa-actions';
import { pushSubAtom } from '@/lib/atoms/pushSubAtom';
import { formatError } from '@/lib/utils';
import { useAtom } from 'jotai';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { IoIosNotificationsOutline } from 'react-icons/io';
import { IoNotificationsOffOutline } from 'react-icons/io5';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import { urlBase64ToUint8Array } from './urlBase64';

export default function PushNotificationManager({
	invisibleMode = false
}: {
	invisibleMode?: boolean;
}) {
	const isSubbing = useRef<boolean>(false);
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useAtom(pushSubAtom);
	const [isSubbingTrans, setIsSubbingTrans] = useTransition();
	const [permission, setPermission] = useState<NotificationPermission>(
		typeof window !== 'undefined' ? Notification.permission : 'default'
	);
	const [currentError, setCurrentError] = useState('');

	const { data: session } = useSession();
	const user = session?.user;

	useEffect(() => {
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			setIsSupported(true);
			registerServiceWorker();
		}
	}, []);

	const checkPermissions = async () => {
		if (!('Notification' in window)) {
			console.error('This browser does not support notifications');
			return;
		}

		try {
			const result = await Notification.requestPermission();

			setPermission(result);

			if (result === 'granted') {
				new Notification('Notifications enabled!', {
					body: "You'll now receive updates from this app.",
					icon: '/android-chrome-192x192.png'
				});
			}
		} catch (err: unknown) {
			console.error(formatError(err));
		}
	};

	const registerServiceWorker = async () => {
		if (!session || !user) {
			return;
		}

		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
			updateViaCache: 'none'
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);

		if (!sub && !isSubbing.current) {
			subscribeToPush();
		}
	};

	const subscribeToPush = async (showSubToast: boolean = false) => {
		if (!session || !user) {
			setCurrentError('You must sign in to subscribe to notifications.');
			return;
		}

		await checkPermissions();
		isSubbing.current = true;
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
			)
		});

		setIsSubbingTrans(async () => {
			const serializedSub = JSON.parse(JSON.stringify(sub));

			const res = await subscribeUser(serializedSub);

			if (res.success) {
				setSubscription(sub);
				if (showSubToast) {
					toast.success(res.message);
				}
			} else {
				if (showSubToast) {
					toast.error(res.message);
				}
			}
		});

		isSubbing.current = false;
	};

	const unsubscribeFromPush = async () => {
		if (!subscription) {
			setCurrentError(
				'You must sign in, or have a current notification subscription to unsubscribe from notifications.'
			);
			return;
		}

		setIsSubbingTrans(async () => {
			const serializedSub = JSON.parse(JSON.stringify(subscription));
			const res = await unsubscribeUser(serializedSub);

			if (res.success) {
				await subscription?.unsubscribe();
				setSubscription(null);
				toast.success(res.message);
			} else {
				toast.error(res.message);
			}
		});
	};

	if (!isSupported || invisibleMode) {
		return null;
	}

	return (
		<Card>
			<CardContent className='text-xs flex flex-col gap-2 mt-2'>
				<CardTitle>Push Notifications</CardTitle>
				{subscription && permission === 'granted' ? (
					<>
						<CardDescription className='text-xs leading-tight'>
							You are subscribed to push notifications.
						</CardDescription>
						<Button
							disabled={isSubbingTrans}
							size={'sm'}
							variant={'secondary'}
							onClick={(e) => {
								e.preventDefault();
								unsubscribeFromPush();
							}}>
							{isSubbingTrans ? <ImSpinner2 /> : <IoNotificationsOffOutline />}
							Unsubscribe
						</Button>
					</>
				) : (
					<>
						<p>You are not subscribed to push notifications.</p>
						<Button
							disabled={isSubbingTrans || permission === 'denied'}
							size={'sm'}
							variant={'secondary'}
							onClick={(e) => {
								e.preventDefault();
								subscribeToPush(true);
							}}>
							{isSubbingTrans ? <ImSpinner2 /> : <IoIosNotificationsOutline />}
							Subscribe
						</Button>
						{permission === 'denied' && (
							<p className='text-xs text-muted-foreground'>
								You have notifications turned off for your browser. To enable
								this feature, go to your browser settings on allow
								Notifications.
							</p>
						)}
					</>
				)}
				{currentError && (
					<p className='text-xs text-muted-foreground text-red-600'>
						{currentError}
					</p>
				)}
			</CardContent>
		</Card>
	);
}

'use client';

import { subscribeUser, unsubscribeUser } from '@/actions/pwa-actions';
import { pushSubAtom } from '@/lib/atoms/pushSubAtom';
import { useAtom } from 'jotai';
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

	useEffect(() => {
		if ('serviceWorker' in navigator && 'PushManager' in window) {
			setIsSupported(true);
			registerServiceWorker();
		}
	}, []);

	const registerServiceWorker = async () => {
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

	// const sendTestNotification = async () => {
	// 	if (subscription) {
	// 		const serializedSub = JSON.parse(JSON.stringify(subscription));
	// 		await sendNotification(serializedSub, message);
	// 		setMessage('');
	// 	}
	// };

	if (!isSupported || invisibleMode) {
		return null;
	}

	return (
		<Card>
			<CardContent className='text-xs flex flex-col gap-2 mt-2'>
				<CardTitle>Push Notifications</CardTitle>
				{subscription ? (
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
							disabled={isSubbingTrans}
							size={'sm'}
							variant={'secondary'}
							onClick={() => subscribeToPush(true)}>
							{isSubbingTrans ? <ImSpinner2 /> : <IoIosNotificationsOutline />}
							Subscribe
						</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}

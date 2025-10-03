'use client';

import {
	sendNotification,
	subscribeUser,
	unsubscribeUser
} from '@/actions/pwa-actions';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { urlBase64ToUint8Array } from './urlBase64';

export default function PushNotificationManager() {
	const isSubbing = useRef<boolean>(false);
	const [isSupported, setIsSupported] = useState(false);
	const [subscription, setSubscription] = useState<PushSubscription | null>(
		null
	);
	const [message, setMessage] = useState('');

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

	const subscribeToPush = async () => {
		isSubbing.current = true;
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
			)
		});

		const serializedSub = JSON.parse(JSON.stringify(sub));

		const res = await subscribeUser(serializedSub);

		if (res.success) {
			setSubscription(sub);
			toast.success(res.message);
		} else {
			toast.error(res.message);
		}

		isSubbing.current = false;
	};

	const unsubscribeFromPush = async () => {
		await subscription?.unsubscribe();

		const res = await unsubscribeUser();

		if (res.success) {
			setSubscription(null);
			toast.success(res.message);
		} else {
			toast.error(res.message);
		}
	};

	const sendTestNotification = async () => {
		if (subscription) {
			await sendNotification(message);
			setMessage('');
		}
	};

	if (!isSupported) {
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
							size={'sm'}
							variant={'secondary'}
							onClick={(e) => {
								e.preventDefault();
								unsubscribeFromPush();
							}}>
							Unsubscribe
						</Button>
						<Input
							onClick={(e) => e.preventDefault()}
							type='text'
							placeholder='Enter notification message'
							value={message}
							onChange={(e) => {
								e.preventDefault();
								setMessage(e.target.value);
							}}
						/>
						<Button
							size={'sm'}
							variant={'secondary'}
							onClick={(e) => {
								e.preventDefault();
								sendTestNotification();
							}}>
							Send Test
						</Button>
					</>
				) : (
					<>
						<p>You are not subscribed to push notifications.</p>
						{/* <Button onClick={subscribeToPush}>Subscribe</Button> */}
					</>
				)}
			</CardContent>
		</Card>
	);
}

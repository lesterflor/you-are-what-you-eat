'use client';

import {
	sendNotification,
	subscribeUser,
	unsubscribeUser
} from '@/actions/pwa-actions';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { urlBase64ToUint8Array } from './urlBase64';

export default function PushNotificationManager() {
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

	async function registerServiceWorker() {
		const registration = await navigator.serviceWorker.register('/sw.js', {
			scope: '/',
			updateViaCache: 'none'
		});
		const sub = await registration.pushManager.getSubscription();
		setSubscription(sub);
	}

	async function subscribeToPush() {
		const registration = await navigator.serviceWorker.ready;
		const sub = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
			)
		});
		setSubscription(sub);
		const serializedSub = JSON.parse(JSON.stringify(sub));
		await subscribeUser(serializedSub);
	}

	async function unsubscribeFromPush() {
		await subscription?.unsubscribe();
		setSubscription(null);
		await unsubscribeUser();
	}

	async function sendTestNotification() {
		if (subscription) {
			await sendNotification(message);
			setMessage('');
		}
	}

	if (!isSupported) {
		// return <p>Push notifications are not supported in this browser.</p>;
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
						<Button onClick={subscribeToPush}>Subscribe</Button>
					</>
				)}
			</CardContent>
		</Card>
	);
}

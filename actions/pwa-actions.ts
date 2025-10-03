'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { PushNotification } from '@/types';
import webpush, { PushSubscription } from 'web-push';

webpush.setVapidDetails(
	'mailto:lesterflor@gmail.com',
	process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
	process.env.VAPID_PRIVATE_KEY!
);

export async function subscribeUser(sub: PushSubscription) {
	const session = await auth();
	const user = session?.user;

	if (!user || !session) {
		throw new Error('User must be authenticated');
	}

	try {
		const data: PushNotification = {
			userId: user.id as string,
			endpoint: sub.endpoint,
			keys: {
				p256dh: sub.keys?.p256dh ?? '',
				auth: sub.keys?.auth ?? ''
			}
		};

		const newSub = await prisma.pushSubscription.create({
			data
		});

		if (!newSub) {
			throw new Error('There was a problem creating a new push subscription');
		}

		return {
			success: true,
			message: 'Successfully subscribed to push notifications',
			data: newSub
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function unsubscribeUser(sub: PushSubscription) {
	const session = await auth();
	const user = session?.user;

	if (!user || !session) {
		throw new Error('User must be authenticated');
	}

	try {
		const existingSub = await prisma.pushSubscription.findFirst({
			where: {
				userId: user.id,
				endpoint: sub.endpoint
			}
		});

		if (!existingSub) {
			return {
				success: true,
				message: 'There was no user subscription to unsubscribe'
			};
		}

		const del = await prisma.pushSubscription.delete({
			where: {
				userId: user.id,
				endpoint: existingSub.endpoint
			}
		});

		if (!del) {
			return {
				success: true,
				message: 'There was a problem deleting the push subscription'
			};
		}

		return {
			success: true,
			message: 'Successfully unsubscribed to push notifications'
		};
	} catch (err: unknown) {
		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function sendNotification(
	sub: PushSubscription,
	message: string,
	title: string = 'You Are What You Eat'
) {
	const session = await auth();
	const user = session?.user;

	if (!user || !session) {
		throw new Error('User must be authenticated');
	}

	const subs = await prisma.pushSubscription.findMany({
		where: {
			NOT: [
				{
					userId: user.id,
					endpoint: sub.endpoint
				}
			]
		}
	});

	if (!subs) {
		throw new Error('No subscription available');
	}

	try {
		for (const sub of subs) {
			const pushSub: PushSubscription = {
				endpoint: sub.endpoint,
				expirationTime: sub.expirationDate
					? sub.expirationDate.getTime()
					: null,
				keys: {
					p256dh: sub.keys?.p256dh ?? '',
					auth: sub.keys?.auth ?? ''
				}
			};

			await webpush.sendNotification(
				pushSub,
				JSON.stringify({
					title: title,
					body: message,
					icon: '/android-chrome-192x192.png'
				})
			);
			return { success: true };
		}
	} catch (error) {
		console.error('Error sending push notification:', error);
		return { success: false, error: 'Failed to send notification' };
	}
}

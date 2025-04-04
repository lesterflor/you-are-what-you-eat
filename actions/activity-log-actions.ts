'use server';

import { auth } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError, getToday } from '@/lib/utils';
import { ActivityItem, GetUser } from '@/types';

export async function getCurrentActivityLog() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		let retLog;

		const existing = await prisma.activityLog.findFirst({
			where: {
				userId: user.id,
				createdAt: {
					gte: getToday().todayStart,
					lt: getToday().todayEnd
				}
			},
			include: {
				activityItems: true
			}
		});

		if (!existing) {
			const newLog = await prisma.activityLog.create({
				data: {
					userId: user.id
				},
				include: {
					activityItems: true
				}
			});

			if (!newLog) {
				throw new Error('Something went wrong creating a new log');
			}

			retLog = newLog;
		} else {
			retLog = existing;
		}

		return {
			success: true,
			message: 'success',
			data: retLog
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function logActivity(activity: ActivityItem) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must be authenticated');
		}

		const resLog = await getCurrentActivityLog();

		if (!resLog.data) {
			throw new Error('Something went wrong getting currentActivityLog');
		}

		const { id: activityLogId } = resLog.data;

		const logItem = await prisma.activityItem.create({
			data: {
				activityLogId,
				userId: user.id,
				...activity
			}
		});

		if (!logItem) {
			throw new Error('Something went wrong creating the new activity');
		}

		return {
			success: true,
			message: 'success'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

'use client';

import { getUserAvatars } from '@/actions/user-actions';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Skeleton } from '../ui/skeleton';

export default function SharedListAvatars({ userIds }: { userIds: string[] }) {
	const [users, setUsers] = useState<
		{ id: string; name: string; image: string }[]
	>([]);
	const [ref, inView] = useInView({ triggerOnce: true });

	useEffect(() => {
		if (userIds.length > 0 && inView) {
			fetchAvatars();
		}
	}, [inView, userIds]);

	const fetchAvatars = async () => {
		const res = await getUserAvatars(userIds);
		if (res.success && res.data) {
			setUsers(res.data as { id: string; name: string; image: string }[]);
		}
	};

	const smallAvatars = useMemo(
		() =>
			users.map((user) => (
				<div key={user.id}>
					<Avatar className='w-6 h-6'>
						<AvatarImage src={user.image} />
						<AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
					</Avatar>
				</div>
			)),
		[users]
	);

	const largeAvatars = useMemo(
		() =>
			users.map((user) => (
				<div key={user.id}>
					<Avatar className='w-16 h-16'>
						<AvatarImage src={user.image} />
						<AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
					</Avatar>
				</div>
			)),
		[users]
	);

	if (userIds.length === 0) return null;

	return (
		<div ref={ref}>
			{users.length > 1 ? (
				<Suspense fallback={<Skeleton className='rounded-full' />}>
					<Popover>
						<PopoverTrigger>
							<div className='flex flex-row -space-x-3'>{smallAvatars}</div>
						</PopoverTrigger>
						<PopoverContent className='flex flex-col gap-4 w-auto'>
							<div className='text-muted-foreground text-xs'>
								This list is shared between
							</div>
							<div className='flex flex-row -space-x-6 items-center justify-center w-full'>
								{largeAvatars}
							</div>
						</PopoverContent>
					</Popover>
				</Suspense>
			) : (
				<Suspense fallback={<Skeleton className='rounded-full w-4 h-4' />}>
					{smallAvatars}
				</Suspense>
			)}
		</div>
	);
}

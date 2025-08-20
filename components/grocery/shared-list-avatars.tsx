'use client';

import { getUserAvatars } from '@/actions/user-actions';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function SharedListAvatars({ userIds }: { userIds: string[] }) {
	const [users, setUsers] = useState<
		{ id: string; name: string; image: string }[]
	>([]);
	const prevUserIdsRef = useRef<string[]>([]);

	// Debounce userIds changes
	useEffect(() => {
		if (
			userIds.length > 0 &&
			JSON.stringify(userIds) !== JSON.stringify(prevUserIdsRef.current)
		) {
			const handler = setTimeout(async () => {
				const res = await getUserAvatars(userIds);
				if (res.success && res.data) {
					// Only update if data actually changed
					if (JSON.stringify(res.data) !== JSON.stringify(users)) {
						setUsers(res.data as { id: string; name: string; image: string }[]);
					}
				}
				prevUserIdsRef.current = userIds;
			});

			return () => clearTimeout(handler);
		}
	}, [userIds]);

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

	if (users.length === 0) return null;

	return (
		<div>
			{users.length > 1 ? (
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
			) : (
				smallAvatars
			)}
		</div>
	);
}

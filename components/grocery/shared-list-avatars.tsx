'use client';

import { getUserAvatars } from '@/actions/user-actions';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function SharedListAvatars({ userIds }: { userIds: string[] }) {
	const [users, setUsers] = useState<
		{ id: string; name: string; image: string }[]
	>([]);

	const getAvatars = async () => {
		const res = await getUserAvatars(userIds);

		if (res.success && res.data) {
			setUsers(res.data as { id: string; name: string; image: string }[]);
		}
	};

	useEffect(() => {
		getAvatars();
	}, []);

	return (
		<>
			<div>
				{users.length > 1 ? (
					<>
						<Popover>
							<PopoverTrigger>
								<div className='flex flex-row -space-x-3'>
									{users.length > 0 &&
										users.map((user) => (
											<div key={user.id}>
												<Avatar className='w-6 h-6'>
													<AvatarImage src={user.image} />
													<AvatarFallback>
														{user.name.slice(0, 1)}
													</AvatarFallback>
												</Avatar>
											</div>
										))}
								</div>
							</PopoverTrigger>
							<PopoverContent className='flex flex-col gap-4 w-auto'>
								<div className='text-muted-foreground text-xs'>
									This list is shared between
								</div>
								<div className='flex flex-row -space-x-6 items-center justify-center w-full'>
									{users.length > 0 &&
										users.map((user) => (
											<div key={user.id}>
												<Avatar className='w-16 h-16'>
													<AvatarImage src={user.image} />
													<AvatarFallback>
														{user.name.slice(0, 1)}
													</AvatarFallback>
												</Avatar>
											</div>
										))}
								</div>
							</PopoverContent>
						</Popover>
					</>
				) : (
					users.length > 0 &&
					users.map((user) => (
						<div key={user.id}>
							<Avatar className='w-6 h-6'>
								<AvatarImage src={user.image} />
								<AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
							</Avatar>
						</div>
					))
				)}
			</div>
		</>
	);
}

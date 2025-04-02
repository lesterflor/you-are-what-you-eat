'use client';

import { getUserAvatars } from '@/actions/user-actions';
import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { FaSpinner } from 'react-icons/fa';

export default function SharedListAvatars({ userIds }: { userIds: string[] }) {
	const [isFetching, setIsFetching] = useState(true);

	const [users, setUsers] = useState<
		{ id: string; name: string; image: string }[]
	>([]);

	const getAvatars = async () => {
		setIsFetching(true);
		const res = await getUserAvatars(userIds);

		if (res.success && res.data) {
			setUsers(res.data as { id: string; name: string; image: string }[]);
		}
		setIsFetching(false);
	};

	useEffect(() => {
		getAvatars();
	}, []);

	return (
		<>
			{isFetching ? (
				<div className='w-8 h-8'>
					<FaSpinner className='w-6 h-6 animate-spin' />
				</div>
			) : (
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
			)}
		</>
	);
}

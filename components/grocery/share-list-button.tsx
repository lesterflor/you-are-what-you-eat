'use client';

import { Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { GetUser } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { getShareableUsers } from '@/actions/user-actions';

export default function ShareListButton({
	onSelect
}: {
	onSelect: (user: string) => void;
}) {
	const getSharedUsers = async () => {
		const res = await getShareableUsers();

		if (res.success && res.data) {
			setUsers(res.data as GetUser[]);
		}
	};

	const [users, setUsers] = useState<GetUser[]>([]);
	const [selectedUser, setSelectedUser] = useState('');

	useEffect(() => {
		getSharedUsers();
	}, []);

	useEffect(() => {
		onSelect(selectedUser);
	}, [selectedUser]);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button>
					<Share2 /> Share with
				</Button>
			</DropdownMenuTrigger>

			<DropdownMenuContent>
				<DropdownMenuRadioGroup
					value={selectedUser}
					onValueChange={setSelectedUser}>
					{users.length > 0 &&
						users.map((item) => (
							<DropdownMenuRadioItem
								key={item.id}
								value={item.id}
								className='flex flex-row items-center gap-2'>
								<Avatar>
									<AvatarImage src={item.image} />
									<AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
								</Avatar>
								<div>{item.name}</div>
							</DropdownMenuRadioItem>
						))}
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

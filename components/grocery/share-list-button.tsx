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
import { FaSpinner } from 'react-icons/fa';
import { useAppDispatch } from '@/lib/hooks';
import { shareGroceryListState } from '@/lib/features/grocery/grocerySlice';

export default function ShareListButton({
	value,
	onSelect
}: {
	value?: string[];
	onSelect: (user: string) => void;
}) {
	const dispatch = useAppDispatch();
	const [users, setUsers] = useState<GetUser[]>([]);
	const [selectedUser, setSelectedUser] = useState('');
	const [isFetching, setIsFetching] = useState(true);
	const [isUserAction, setIsUserAction] = useState(false);

	const getSharedUsers = async () => {
		setIsFetching(true);
		const res = await getShareableUsers();

		if (res.success && res.data) {
			setUsers(res.data as GetUser[]);
		}

		setIsFetching(false);
	};

	const findSelectedUser = (id: string) => {
		const found = users.filter((usr) => usr.id === id);

		return found;
	};

	useEffect(() => {
		setIsUserAction(false);
		setIsFetching(true);
		if (value && value.length > 0) {
			// extract passed sharedUsers first item
			const clean = value.filter((cln) => cln !== '');
			const [first] = clean;

			const sharedFound = users.filter((usr) => usr.id === first);

			if (sharedFound.length > 0) {
				setSelectedUser(first);
			}
		}
		setIsFetching(false);
	}, [users]);

	useEffect(() => {
		getSharedUsers();
	}, []);

	useEffect(() => {
		if (isUserAction) {
			// redux
			dispatch(
				shareGroceryListState(JSON.stringify(findSelectedUser(selectedUser)))
			);
		}

		onSelect(selectedUser);
	}, [selectedUser]);

	return (
		<>
			{isFetching ? (
				<div className='w-20 h-8 flex flex-col items-center justify-center'>
					<FaSpinner className='w-6 h-6 animate-spin' />
				</div>
			) : (
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
										onSelect={() => {
											setIsUserAction(true);
										}}
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
			)}
		</>
	);
}

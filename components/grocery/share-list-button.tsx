'use client';

import { shareGroceryListState } from '@/lib/features/grocery/grocerySlice';
import { useAppDispatch } from '@/lib/hooks';
import { getShareableUsersQueryOptions } from '@/lib/queries/userQueries';
import { useQuery } from '@tanstack/react-query';
import { Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TbShare } from 'react-icons/tb';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger
} from '../ui/dropdown-menu';

export default function ShareListButton({
	value,
	onSelect,
	iconMode = false
}: {
	value?: string[];
	onSelect: (user: string) => void;
	iconMode?: boolean;
}) {
	const dispatch = useAppDispatch();
	const [selectedUser, setSelectedUser] = useState('');
	const [isUserAction, setIsUserAction] = useState(false);

	const { data: users, isFetching } = useQuery(getShareableUsersQueryOptions());

	const findSelectedUser = (id: string) => {
		const found = users?.filter((usr) => usr.id === id);

		return found;
	};

	useEffect(() => {
		setIsUserAction(false);
		if (value && value.length > 0) {
			// extract passed sharedUsers first item
			const clean = value.filter((cln) => cln !== '');
			const [first] = clean;

			const sharedFound = users?.filter((usr) => usr.id === first);

			if (sharedFound && sharedFound.length > 0) {
				setSelectedUser(first);
			}
		}
	}, [users]);

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
				iconMode ? (
					<ImSpinner2 className='w-6 h-6 animate-spin opacity-25' />
				) : (
					<div className='w-20 h-8 flex flex-col items-center justify-center'>
						<ImSpinner2 className='w-6 h-6 animate-spin' />
					</div>
				)
			) : (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						{iconMode ? (
							<Button
								variant={'secondary'}
								size={'icon'}>
								<Share2 />
							</Button>
						) : (
							<Button>
								<Share2 /> Share with
							</Button>
						)}
					</DropdownMenuTrigger>

					<DropdownMenuContent className='flex flex-col gap-2'>
						<div className='flex flex-row items-center text-muted-foreground gap-2'>
							<TbShare className='w-6 h-6' />
							Share this with
						</div>
						<DropdownMenuRadioGroup
							value={selectedUser}
							onValueChange={setSelectedUser}>
							{users &&
								users.length > 0 &&
								users.map((item) => (
									<DropdownMenuRadioItem
										onSelect={() => {
											setIsUserAction(true);
										}}
										key={item.id}
										value={item.id}
										className='flex flex-row items-center gap-2'>
										<Avatar>
											<AvatarImage src={item.image as string} />
											{item.name && (
												<AvatarFallback>{item.name.slice(0, 1)}</AvatarFallback>
											)}
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

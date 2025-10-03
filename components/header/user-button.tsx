'use client';

import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { User } from '@/types';
import { UserIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import PushNotificationManager from '../pwa/push-notification-manager';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import SignOutButton from './sign-out-button';

export default function UserButton() {
	const { data: session } = useSession();

	const user = session?.user as User;

	if (!session || !user) {
		return (
			<Button asChild>
				<Link
					href='/sign-in'
					className='flex flex-row items-center'>
					<UserIcon />
					<div className='block portrait:hidden'>Sign In</div>
				</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Avatar className='flex items-center w-10 h-10'>
					<AvatarImage
						src={user.image}
						alt={user.name}
					/>
					<AvatarFallback aria-label={user.name}>
						{user.name.slice(0, 1).toUpperCase()}
					</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className='w-56 p-2'
				align='end'
				forceMount>
				<DropdownMenuLabel className='font-normal'>
					<div className='flex flex-col space-y-1 pb-5'>
						<div className='text-sm font-medium leading-none'>
							{session.user?.name}
						</div>

						<div className='text-sm text-muted-foreground leading-none'>
							{session.user?.email}
						</div>
					</div>
				</DropdownMenuLabel>

				{user?.role === 'admin' && (
					<>
						<DropdownMenuItem>
							<Link
								href='/admin'
								className='w-full'>
								Admin
							</Link>
						</DropdownMenuItem>
					</>
				)}

				<DropdownMenuItem asChild>
					<div className=' flex flex-col items-end justify-end'>
						<PushNotificationManager />
					</div>
				</DropdownMenuItem>

				<DropdownMenuItem asChild>
					<div className=' flex flex-col items-end justify-end'>
						<SignOutButton />
					</div>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

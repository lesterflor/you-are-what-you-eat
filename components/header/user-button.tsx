import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { auth } from '@/db/auth';
import { User } from '@/types';
import { UserIcon } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import SignOutButton from './sign-out-button';

export default async function UserButton() {
	const session = await auth();

	const user = session?.user as User;

	if (!session) {
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

	const firstInitial = session.user?.name?.[0].toUpperCase() ?? '';

	return (
		<div className='flex gap-2 items-center'>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<div className='flex items-center w-[50px] portrait:w-auto'>
						<Avatar>
							<AvatarImage src={user.image} />
							<AvatarFallback>{firstInitial}</AvatarFallback>
						</Avatar>
					</div>
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
							<SignOutButton />
						</div>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

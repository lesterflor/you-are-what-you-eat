import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { UserIcon } from 'lucide-react';
import { auth } from '@/db/auth';
import { User } from '@/types';
import Image from 'next/image';
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
					<div className='flex items-center w-[50px]'>
						{!user.image ? (
							<Button
								variant='ghost'
								className='relative w-8 h-8 rounded-full ml-2 flex items-center justify-center bg-gray-200 cursor-pointer dark:text-gray-800'>
								{firstInitial}
							</Button>
						) : (
							<Image
								className='relative w-8 h-8 rounded-full ml-2 object-cover cursor-pointer'
								src={user.image}
								width={50}
								height={50}
								alt={user?.name}
							/>
						)}
					</div>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					className='w-56'
					align='end'
					forceMount>
					<DropdownMenuLabel className='font-normal'>
						<div className='flex flex-col space-y-1'>
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

					<DropdownMenuItem
						className='p-0 mb-1'
						asChild>
						<SignOutButton />
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}

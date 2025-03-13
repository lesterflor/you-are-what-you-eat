'use client';

import Link from 'next/link';
import { Button } from '../ui/button';
import { FileStack } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function LogButton() {
	const pathname = usePathname();

	return (
		<Button
			asChild
			className={cn(pathname === '/logs' && 'hidden')}>
			<Link
				href='/logs'
				className='flex flex-row items-center gap-2'>
				<FileStack className='w-4 h-4' />
				Logs
			</Link>
		</Button>
	);
}

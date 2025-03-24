'use client';

import { getLogsByUserId } from '@/actions/log-actions';
import { GetLog, GetUser } from '@/types';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Filter } from 'lucide-react';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

export default function LogFilter() {
	const [logs, setLogs] = useState<GetLog[]>([]);
	const [filter, setFilter] = useState('all');

	const { data: session } = useSession();
	const user = session?.user as GetUser;
	const router = useRouter();

	const getLogs = async () => {
		if (!user) {
			return;
		}
		const res = await getLogsByUserId(user.id);

		if (res.success) {
			setLogs(res.data as GetLog[]);
		}
	};

	useEffect(() => {
		getLogs();
	}, []);

	useEffect(() => {
		if (filter) {
			router.push(filter === 'all' ? '/logs' : `/logs?logId=${filter}`);
		}
	}, [filter]);

	return (
		<>
			{logs.length > 0 && (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='secondary'>
							<Filter className='w-4 -h-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuLabel className='flex flex-row items-center gap-2'>
							<Filter className='w-4 h-4' />
							Filter Date
						</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<ScrollArea className='h-[50vh]'>
							<DropdownMenuRadioGroup
								value={filter}
								onValueChange={setFilter}>
								<DropdownMenuRadioItem
									value='all'
									className={cn(
										'font-normal text-xs text-muted-foreground',
										'all' === filter && 'text-foreground font-semibold'
									)}>
									All
								</DropdownMenuRadioItem>
								{logs.map((item) => (
									<DropdownMenuRadioItem
										className={cn(
											'font-normal text-xs text-muted-foreground',
											item.id === filter && 'text-foreground font-semibold'
										)}
										key={item.id}
										value={item.id}>
										{format(item.createdAt, 'eee PP')}
									</DropdownMenuRadioItem>
								))}
							</DropdownMenuRadioGroup>
						</ScrollArea>
					</DropdownMenuContent>
				</DropdownMenu>
			)}
		</>
	);
}

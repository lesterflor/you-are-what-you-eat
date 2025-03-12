import Link from 'next/link';
import ModeToggle from './mode-toggle';
import UserButton from './user-button';
import { IoFastFoodOutline } from 'react-icons/io5';
import { createDailyLog } from '@/actions/log-actions';
import LogSheet from '../logs/log-sheet';
import { GetLog } from '@/types';

export default async function SiteHeader() {
	const log = await createDailyLog();

	return (
		<header className='w-full border-b fixed top-0 z-50 bg-white dark:bg-green-950 select-none px-3'>
			<div className='wrapper flex flex-between justify-between items-center w-full p-2'>
				<div className='flex flex-row items-center justify-start gap-5 portrait:gap-3'>
					<Link href='/'>
						<div className='flex flex-row items-center gap-2'>
							<IoFastFoodOutline className='w-8 h-8' />
							<div className='flex flex-col gap-0'>
								<span className='dark:text-white text-black text-3xl font-bold portrait:hidden'>
									You are what you eat
								</span>
								<span className='text-xs portrait:hidden'>
									Track the food you eat and stop wondering
								</span>
							</div>
						</div>
					</Link>
				</div>

				<div>
					<LogSheet log={log?.data as GetLog} />
				</div>

				<div className='flex flex-row justify-end gap-1 items-center'>
					<div className='block portrait:hidden'>
						<ModeToggle />
					</div>

					<UserButton />
				</div>
			</div>
		</header>
	);
}

import Link from 'next/link';
import ModeToggle from './mode-toggle';
import UserButton from './user-button';
import { createDailyLog } from '@/actions/log-actions';
import LogSheet from '../logs/log-sheet';
import { GetLog } from '@/types';
import { Calculator, UtensilsCrossed } from 'lucide-react';
import LogButton from '../logs/log-button';
import LogMacrosSummary from '../logs/log-macros-summary';
import { format } from 'date-fns';
import SideMenu from './side-menu';
import { getToday } from '@/lib/utils';

export default async function SiteHeader() {
	const { todayStart, todayEnd, current } = getToday();

	const log = await createDailyLog();

	return (
		<header className='w-full border-b fixed top-0 z-50 bg-white dark:bg-green-950 select-none px-3'>
			<div className='wrapper flex flex-between justify-between items-center w-full p-2'>
				<div className='flex flex-row items-center justify-start gap-5 portrait:gap-3'>
					<Link href='/'>
						<div className='flex flex-row items-center gap-2'>
							<UtensilsCrossed className='w-8 h-8' />
							<div className='flex flex-col gap-0'>
								<span className='dark:text-white text-black text-2xl font-bold portrait:hidden thin-title'>
									You are what you eat
								</span>
								<span className='text-xs portrait:hidden'>
									Track the food you eat and stop wondering
								</span>
							</div>
						</div>
					</Link>
				</div>

				{log && log.data && (
					<div>
						<LogMacrosSummary
							compactMode={true}
							useSkeleton={false}>
							<div className='flex flex-row items-center gap-2'>
								<Calculator className='w-4 h-4 animate-pulse' />
								<div>{format(todayStart, 'PP hh:mm a')}</div>
								<div>{format(todayEnd, 'PP hh:mm a')}</div>
								<div>{format(current, 'PP hh:mm a')}</div>
							</div>
						</LogMacrosSummary>
					</div>
				)}

				<div className='hidden lg:block'>
					<LogButton />
				</div>

				<div className='flex flex-row justify-end gap-1 items-center'>
					<div className='hidden lg:block'>
						<LogSheet log={log?.data as GetLog} />
					</div>
					<div className='hidden lg:block'>
						<ModeToggle />
					</div>

					<UserButton />
				</div>
				<div>
					<SideMenu log={log?.data as GetLog} />
				</div>
			</div>
		</header>
	);
}

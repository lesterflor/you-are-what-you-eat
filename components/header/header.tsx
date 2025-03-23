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
import { auth } from '@/db/auth';

export default async function SiteHeader() {
	const session = await auth();
	const { current } = getToday();

	const log = await createDailyLog();

	return (
		<header className='w-full border-b fixed top-0 z-50 bg-white dark:bg-green-950 select-none px-0'>
			<div className='wrapper flex flex-between justify-between items-center w-full p-2'>
				<div className='flex flex-row items-center justify-start gap-5 portrait:gap-0'>
					<Link href='/'>
						<div className='flex flex-row items-center gap-2'>
							<UtensilsCrossed className='w-8 h-8' />
							<div className='flex flex-col gap-0'>
								{!session ? (
									<>
										<span className='dark:text-white text-black text-2xl font-bold thin-title'>
											You are what you eat
										</span>

										<span className='text-xs'>
											Track the food you eat and stop wondering
										</span>
									</>
								) : (
									<>
										<span className='dark:text-white text-black text-2xl font-bold thin-title portrait:hidden'>
											You are what you eat
										</span>

										<span className='text-xs portrait:hidden'>
											Track the food you eat and stop wondering
										</span>
									</>
								)}
							</div>
						</div>
					</Link>
				</div>

				{session && log && log.data && (
					<div>
						<LogMacrosSummary
							log={log.data as GetLog}
							compactMode={true}
							useSkeleton={false}>
							<div className='flex flex-row items-center gap-2'>
								<Calculator className='w-4 h-4 animate-pulse' />
								<div>{format(current, 'PP hh:mm a')}</div>
							</div>
						</LogMacrosSummary>
					</div>
				)}

				<div className='hidden lg:block'>
					<LogButton />
				</div>

				<div className='flex flex-row portrait:flex-col justify-end gap-2 items-center'>
					<div className='hidden lg:block'>
						<LogSheet log={log?.data as GetLog} />
					</div>
					<div className='hidden lg:block'>
						<ModeToggle />
					</div>

					<UserButton />

					<div>
						<SideMenu log={log?.data as GetLog} />
					</div>
				</div>
			</div>
		</header>
	);
}

import { auth } from '@/db/auth';
import { getToday } from '@/lib/utils';
import { format } from 'date-fns';
import { Calculator, UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { lazy } from 'react';
import ModeToggle from './mode-toggle';
import UserButton from './user-button';

const DishCreationPopoverLazy = lazy(
	() => import('@/components/dish/dish-creation-popover')
);

const ReduxStoreLoggerLazy = lazy(
	() => import('@/components/redux-store-logger')
);

const SideMenuLazy = lazy(() => import('@/components/header/side-menu'));

const LogMacrosSummaryCurrentLazy = lazy(
	() => import('@/components/logs/log-macros-summary-current')
);

const LogSheetLazy = lazy(() => import('@/components/logs/log-sheet'));

export default async function SiteHeader() {
	const session = await auth();
	const { current } = getToday();

	return (
		<header className='w-full border-b fixed top-0 z-50 bg-white dark:bg-green-950 select-none px-0'>
			<div className='wrapper flex flex-between justify-between items-center w-full p-2 relative'>
				<div className='absolute -bottom-4 left-0 flex flex-row items-center gap-2'>
					<ReduxStoreLoggerLazy />
					<DishCreationPopoverLazy />
				</div>
				<div className='flex flex-row items-center justify-start gap-5 portrait:gap-0 h-full'>
					<Link href='/'>
						<div className='flex flex-row items-center gap-2 h-full'>
							<div className='portrait:h-[7vh] portrait:align-top'>
								<UtensilsCrossed className='w-8 h-8' />
							</div>

							<div className='flex flex-col gap-0'>
								{!session ? (
									<>
										<h1 className='dark:text-white text-black text-2xl font-bold'>
											You Are What You Eat
										</h1>

										<span className='text-xs'>
											Track the food you eat and stop wondering
										</span>
									</>
								) : (
									<>
										<h1 className='dark:text-white text-black text-2xl font-bold portrait:hidden'>
											You Are What You Eat
										</h1>

										<span className='text-xs portrait:hidden'>
											Track the food you eat and stop wondering
										</span>
									</>
								)}
							</div>
						</div>
					</Link>
				</div>

				{session && (
					<div className='flex flex-col items-center gap-0'>
						<LogMacrosSummaryCurrentLazy
							compactMode={true}
							useSkeleton={false}>
							<div className='flex flex-row items-center gap-2'>
								<Calculator className='w-4 h-4' />
								<div>{format(current, 'eee PP h:mm a')}</div>
							</div>
						</LogMacrosSummaryCurrentLazy>
						<div className='text-xs text-muted-foreground pt-1'>
							You are what you eat,{' '}
							<span className='font-semibold'>{session.user?.name}</span>
						</div>
					</div>
				)}

				{/* <div className='hidden lg:block'>
					<LogButton />
				</div> */}

				<div className='flex flex-row portrait:flex-col justify-end gap-2 items-center'>
					<div className='hidden lg:block'>
						<LogSheetLazy />
					</div>
					<div className='hidden lg:block'>
						<ModeToggle />
					</div>

					<UserButton />

					<div>
						<SideMenuLazy />
					</div>
				</div>
			</div>
		</header>
	);
}

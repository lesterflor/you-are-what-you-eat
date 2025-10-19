import { auth } from '@/db/auth';
import { appVersion } from '@/lib/version';
import { UtensilsCrossed } from 'lucide-react';
import Link from 'next/link';
import { lazy } from 'react';
import CurrentDayHud from './current-day-hud';
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

	return (
		<header className='w-full border-b fixed top-0 z-50 bg-white dark:bg-green-950 select-none px-0'>
			<div className='wrapper flex flex-between justify-between items-center w-full p-2 relative'>
				<div className='absolute -bottom-4 left-0 flex flex-row items-center gap-2'>
					{session && <ReduxStoreLoggerLazy />}

					<DishCreationPopoverLazy />
				</div>
				<div className='flex flex-row items-center justify-start gap-5 portrait:gap-0 h-full'>
					<Link href='/'>
						<div className='flex flex-row items-center gap-2 h-full'>
							<div className='portrait:h-[7vh] portrait:align-top w-12 h-10 rounded-full bg-emerald-900 flex items-center justify-center relative'>
								<UtensilsCrossed className='w-8 h-8 text-white' />
								<div className='absolute bottom-0 text-[8px] text-white dark:text-muted-foreground font-extralight'>
									{appVersion}
								</div>
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
							<CurrentDayHud />
						</LogMacrosSummaryCurrentLazy>
						<div className='text-xs text-muted-foreground pt-1'>
							You are what you eat,{' '}
							<span className='font-semibold'>{session.user?.name}</span>
						</div>
					</div>
				)}

				<div className='flex flex-row portrait:flex-col justify-end gap-2 items-center'>
					<div className='hidden lg:block'>
						<LogSheetLazy />
					</div>
					<div className='hidden lg:block'>
						<ModeToggle />
					</div>

					<UserButton />

					{session && (
						<div>
							<SideMenuLazy />
						</div>
					)}
				</div>
			</div>
		</header>
	);
}

import type { Metadata } from 'next';
import '../globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/db/auth';
import { Suspense } from 'react';
import SiteHeader from '@/components/header/header';
import FoodItemCardSkeleton from '@/components/skeletons/food-item-card-skeleton';

export const metadata: Metadata = {
	title: {
		template: `%s - You are what you eat`,
		default: 'You are what you eat'
	},
	description:
		'What you put in your mouth determines what your body is composed of.  Find out the composition of your body by tracking what you eat.'
};

export default async function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode;
}>) {
	const session = await auth();

	return (
		<html
			lang='en'
			suppressHydrationWarning>
			<body>
				<ThemeProvider
					attribute='class'
					defaultTheme='dark'
					enableSystem
					disableTransitionOnChange>
					<SessionProvider session={session}>
						<SiteHeader />
						<br />
						<main className='flex-1 wrapper w-5/6 xl:w-1/2 portrait:w-full portrait:px-3 mx-auto mt-20'>
							<Suspense fallback={<FoodItemCardSkeleton />}>
								<div className='select-none'>{children}</div>
							</Suspense>
						</main>
					</SessionProvider>

					<Toaster />
				</ThemeProvider>
				<br />
				<br />
				<br />
			</body>
		</html>
	);
}

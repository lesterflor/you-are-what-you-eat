import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { SessionProvider } from 'next-auth/react';
import { auth } from '@/db/auth';
import { Suspense } from 'react';
import SiteHeader from '@/components/header/header';
import { ThemeProvider } from '@/components/theme-provider';
import LogContextProvider from '@/providers/log-context-provider';
import FoodSearchProvider from '@/providers/food-search-provider';
import SearchFoodProvider from '@/providers/search-food-provider';
import FoodUpdateProvider from '@/providers/food-update-provider';
import NoteContextProvider from '@/providers/note-update-provider';

export const metadata: Metadata = {
	title: {
		template: `%s - You are what you eat`,
		default: 'You are what you eat'
	},
	description:
		'What you put in your mouth determines what your body is composed of.  Find out the composition of your body by tracking what you eat.',
	authors: [{ name: 'Lester Flor', url: 'https://lester-flor.vercel.app' }]
};

export const viewport: Viewport = {
	width: 'device-width',
	initialScale: 1,
	maximumScale: 1,
	userScalable: false
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
						<LogContextProvider>
							<FoodSearchProvider>
								<SearchFoodProvider>
									<FoodUpdateProvider>
										<NoteContextProvider>
											<SiteHeader />
											<br />
											<main className='flex-1 wrapper w-5/6 portrait:w-full portrait:px-3 mx-auto mt-20'>
												<Suspense>
													<div className='select-none'>{children}</div>
												</Suspense>
											</main>
										</NoteContextProvider>
									</FoodUpdateProvider>
								</SearchFoodProvider>
							</FoodSearchProvider>
						</LogContextProvider>
					</SessionProvider>

					<Toaster
						expand={true}
						richColors
					/>
				</ThemeProvider>
				<br />
				<br />
				<br />
			</body>
		</html>
	);
}

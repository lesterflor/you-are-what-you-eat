import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth } from '@/db/auth';
import CredentialsSignInForm from './sign-in-form';
import { UtensilsCrossed } from 'lucide-react';

export const metadata: Metadata = {
	title: 'Sign In'
};

export default async function SignInPage(props: {
	searchParams: Promise<{
		callbackUrl: string;
	}>;
}) {
	const { callbackUrl = '/' } = await props.searchParams;

	const session = await auth();

	if (session) {
		return redirect(callbackUrl);
	}

	return (
		<div className='w-full max-w-md mx-auto'>
			<br />
			<Card>
				<CardHeader className='space-y-2 flex flex-col gap-2 items-center'>
					<Link
						href='/'
						className='flex-center'>
						<UtensilsCrossed className='w-12 h-12' />
					</Link>
					<CardTitle className='text-center'>
						Sign In to start logging calories
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-2'>
					<CredentialsSignInForm />
				</CardContent>
			</Card>
		</div>
	);
}

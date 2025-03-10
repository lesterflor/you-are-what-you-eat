import { auth } from '@/db/auth';
import { redirect } from 'next/navigation';

export default async function Home() {
	const session = await auth();

	if (!session) {
		redirect('/sign-in');
	}

	return <div>You are what you eat {session.user?.name}</div>;
}

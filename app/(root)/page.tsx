import { createDailyLog } from '@/actions/log-actions';
import AddFoodItemForm from '@/components/food-items/add-food-item-form';
import { Button } from '@/components/ui/button';
import { auth } from '@/db/auth';
import Link from 'next/link';

export default async function Home() {
	const session = await auth();

	await createDailyLog();

	return (
		<>
			{session ? (
				<div className='flex flex-col gap-4'>
					<div className='text-lg'>
						You are what you eat{' '}
						<span className='font-semibold'>{session.user?.name}</span>
					</div>
					<div>
						<AddFoodItemForm />
					</div>
				</div>
			) : (
				<div className='flex flex-col gap-4'>
					<div>Track what you eat, so you know what you are made of.</div>
					<div>Start tracking now!</div>
					<Button asChild>
						<Link href='/sign-in'>Sign In</Link>
					</Button>
				</div>
			)}
		</>
	);
}

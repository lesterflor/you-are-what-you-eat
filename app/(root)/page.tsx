import AddFoodItemForm from '@/components/food-items/add-food-item-form';
import { Button } from '@/components/ui/button';
import { auth } from '@/db/auth';
import Link from 'next/link';

export default async function Home() {
	const session = await auth();

	return (
		<>
			{session ? (
				<div className='flex flex-col gap-4'>
					<div>You are what you eat {session.user?.name}</div>
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

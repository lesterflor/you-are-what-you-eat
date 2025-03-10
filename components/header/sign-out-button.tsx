'use client';
import { signOutUser } from '@/actions/user-actions';
import { Button } from '../ui/button';

export default function SignOutButton() {
	return (
		<Button
			variant='destructive'
			onClick={async () => {
				await signOutUser();
			}}>
			Sign Away
		</Button>
	);
}

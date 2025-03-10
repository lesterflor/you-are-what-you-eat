'use client';
import { signOutUser } from '@/actions/user-actions';
import { Button } from '../ui/button';

export default function SignOutButton() {
	return (
		<Button
			onClick={async () => {
				await signOutUser();
			}}>
			Sign Out
		</Button>
	);
}

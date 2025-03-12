'use client';

import { Button } from '@/components/ui/button';
import { FaGoogle } from 'react-icons/fa';
import { signInGoogle } from '@/actions/user-actions';

export default function CredentialsSignInForm() {
	return (
		<>
			{/* <div className='w-full pt-5'>
				<Button
					variant='secondary'
					className='w-full'
					onClick={async () => {
						await signInGitHub();
					}}>
					<FaGithub className='w-4 h-4' />
					Sign in with GitHub
				</Button>
			</div> */}

			<div className='w-full pt-5'>
				<Button
					variant='secondary'
					className='w-full'
					onClick={async () => {
						await signInGoogle();
					}}>
					<FaGoogle className='w-4 h-4' />
					Sign in with Google
				</Button>
			</div>
		</>
	);
}

'use server';

import { auth, signIn, signOut } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { signInFormSchema, signUpFormSchema } from '@/lib/validators';
import { hashSync } from 'bcrypt-ts-edge';
import { isRedirectError } from 'next/dist/client/components/redirect-error';

// sign in with Github
export async function signInGitHub() {
	return signIn('github');
}

// sign in with Google
export async function signInGoogle() {
	return signIn('google');
}

// sign in the user with credentials
export async function signInWithCredentials(
	prevState: unknown,
	formData: FormData
) {
	try {
		const user = signInFormSchema.parse({
			email: formData.get('email'),
			password: formData.get('password')
		});

		await signIn('credentials', user);

		return {
			success: true,
			message: 'Signed In Successfully'
		};
	} catch (err: unknown) {
		if (isRedirectError(err)) {
			throw err;
		}

		return {
			success: false,
			message: 'Invalid credentials'
		};
	}
}

// sign out user
export async function signOutUser() {
	console.log('signing out');
	await signOut({ redirect: true, redirectTo: '/' });
}

// sign up user
export async function signUpUser(prevState: unknown, formData: FormData) {
	try {
		const user = signUpFormSchema.parse({
			name: formData.get('name'),
			email: formData.get('email'),
			password: formData.get('password'),
			confirmPassword: formData.get('confirmPassword')
		});

		const unHashedPassword = user.password;

		user.password = hashSync(user.password, 10);

		await prisma.user.create({
			data: {
				name: user.name,
				email: user.email,
				password: user.password
			}
		});

		await signIn('credentials', {
			email: user.email,
			password: unHashedPassword
		});

		return {
			success: true,
			message: 'Successfully created user'
		};
	} catch (err: unknown) {
		if (isRedirectError(err)) {
			throw err;
		}

		return {
			success: false,
			message: formatError(err)
		};
	}
}

export async function getUserById(userId: string) {
	const user = await prisma.user.findFirst({
		where: {
			id: userId
		}
	});

	if (!user) {
		throw new Error('User not found');
	}

	return user;
}

export async function getPublicUserById(userId: string) {
	const user = await prisma.user.findFirst({
		where: {
			id: userId
		},
		select: {
			id: true,
			name: true,
			email: true,
			image: true,
			createdAt: true,
			role: true
		}
	});

	return user;
}

// update the user profile
export async function updateProfileAction(user: {
	name: string;
	email: string;
	image?: string;
}) {
	try {
		const session = await auth();

		if (!session?.user?.id) {
			throw new Error('User is not authenticated');
		}

		const currentUser = await prisma.user.findFirst({
			where: {
				id: session?.user?.id
			}
		});

		if (!currentUser) {
			throw new Error('User was not found');
		}

		await prisma.user.update({
			where: {
				id: currentUser.id
			},
			data: {
				name: user.name,
				image: user.image
			}
		});

		return {
			success: true,
			message: 'User updated successfully'
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

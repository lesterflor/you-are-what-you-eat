'use server';

import { auth, signIn, signOut } from '@/db/auth';
import prisma from '@/db/prisma';
import { formatError } from '@/lib/utils';
import { signInFormSchema, signUpFormSchema } from '@/lib/validators';
import { GetUser } from '@/types';
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

export async function getUserNameById(userId: string) {
	const session = await auth();
	const user = session?.user as GetUser;

	if (userId === user.id) {
		return 'you';
	}

	const notMe = await prisma.user.findFirst({
		where: {
			id: userId
		}
	});

	return notMe?.name ?? 'you';
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

export async function getUserFoods(id: string) {
	try {
		const session = await auth();

		if (!session) {
			throw new Error('User must authenticated');
		}

		const userFoods = await prisma.user.findFirst({
			where: { id },
			include: {
				FoodItems: true
			}
		});

		const foods = userFoods?.FoodItems ?? [];

		return {
			success: true,
			message: 'success',
			data: foods
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getShareableUsers() {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must authenticated');
		}

		const users = await prisma.user.findMany({
			where: {
				id: {
					not: user.id
				}
			},
			select: {
				name: true,
				image: true,
				id: true
			}
		});

		return {
			success: true,
			message: 'success',
			data: users
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

export async function getUserAvatars(userIds: string[]) {
	try {
		const session = await auth();
		const user = session?.user as GetUser;

		if (!session || !user) {
			throw new Error('User must authenticated');
		}

		const filtered = userIds.filter((us) => us !== '');
		if (!filtered.includes(user.id)) {
			filtered.push(user.id);
		}

		const allUsers = await prisma.user.findMany({
			where: {
				id: {
					in: filtered
				}
			},
			select: {
				id: true,
				name: true,
				image: true
			}
		});

		return {
			success: true,
			message: 'success',
			data: allUsers
		};
	} catch (error: unknown) {
		return {
			success: false,
			message: formatError(error)
		};
	}
}

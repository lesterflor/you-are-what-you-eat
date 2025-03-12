import { createDailyLog } from '@/actions/log-actions';
import AddFoodSheet from '@/components/food-items/add-food-sheet';
import FoodLogList from '@/components/logs/log-list';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { auth } from '@/db/auth';
import { GetLog } from '@/types';
import { Search } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
	const session = await auth();

	const log = await createDailyLog();

	return (
		<>
			{session ? (
				<div className='flex flex-col gap-4 w-full'>
					<div className='text-lg'>
						You are what you eat{' '}
						<span className='font-semibold'>{session.user?.name}</span>
					</div>
					<div className='flex flex-row items-center justify-between w-full gap-2'>
						<div>
							<AddFoodSheet />
						</div>
						<div className='flex flex-row items-center gap-4'>
							Search Food{' '}
							<Button asChild>
								<Link href='/foods'>
									<Search className='w-4 h-4' /> Browse
								</Link>
							</Button>
						</div>
					</div>
					<Separator />
					<div>
						<FoodLogList
							log={log?.data as GetLog}
							useScroller={false}
						/>
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

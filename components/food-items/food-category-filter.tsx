'use client';

import { useRouter } from 'next/navigation';
import FoodCategoryPicker from './food-categories';
import { useEffect, useState } from 'react';

export default function FoodCategoryFilter({
	compactMode = false
}: {
	compactMode?: boolean;
}) {
	const router = useRouter();
	const [filter, setFilter] = useState('');

	useEffect(() => {
		if (filter) {
			router.push(`/foods?category=${filter}`);
		}
	}, [filter]);

	return (
		<>
			<div className='portrait:hidden'>
				<FoodCategoryPicker
					showFilterIcon={true}
					compactMode={compactMode}
					onSelect={(value) => {
						setFilter(value);
					}}
				/>
			</div>

			<div className='hidden portrait:flex items-center flex-col'>
				<FoodCategoryPicker
					iconsOnly={true}
					showFilterIcon={true}
					compactMode={compactMode}
					onSelect={(value) => {
						setFilter(value);
					}}
				/>
			</div>
		</>
	);
}

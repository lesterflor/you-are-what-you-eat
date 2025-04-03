'use client';

import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import { cn } from '@/lib/utils';
import { FilterX } from 'lucide-react';
import { Button } from '../ui/button';
import { useSession } from 'next-auth/react';
import { GetUser } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
	allSearch,
	categorySearch,
	selectFoodSearchStatus,
	userSearch
} from '@/lib/features/food/foodSearchSlice';

export default function FoodCategoryPicker({
	value = '',
	onSelect,
	compactMode = false,
	showFilterIcon = false,
	iconsOnly = false,
	suppressUser = false,
	disableReduxDispatch = false
}: {
	onSelect: (data: string) => void;
	value?: string;
	compactMode?: boolean;
	showFilterIcon?: boolean;
	iconsOnly?: boolean;
	suppressUser?: boolean;
	disableReduxDispatch?: boolean;
}) {
	const [selected, setSelected] = useState(value);
	const { data: session } = useSession();
	const user = session?.user as GetUser;
	const dispatch = useAppDispatch();
	const foodSearchStatus = useAppSelector(selectFoodSearchStatus);

	useEffect(() => {
		onSelect(selected);

		if (!disableReduxDispatch) {
			if (selected) {
				switch (selected) {
					case 'user':
						if (!suppressUser) {
							dispatch(userSearch(user.id));
						}
						break;
					default:
						dispatch(categorySearch(selected));
						break;
				}
			}
		}
	}, [selected]);

	useEffect(() => {
		if (!disableReduxDispatch) {
			if (foodSearchStatus !== 'category') {
				setSelected('');
			}
		}
	}, [foodSearchStatus]);

	return (
		<div
			className={cn(
				'flex flex-row gap-1 p-1 rounded-md border-2',
				compactMode && 'border-0 p-0 gap-0'
			)}>
			{showFilterIcon && (
				<Button
					size='icon'
					variant='outline'
					onClick={(e) => {
						e.preventDefault();
						//setSelected('');

						dispatch(allSearch());
					}}>
					<FilterX className='w-4 h-4' />
				</Button>
			)}
			<ToggleGroup
				size='sm'
				className={cn(
					'flex flex-row gap-x-1 gap-y-0 flex-wrap',
					compactMode && 'gap-0'
				)}
				type='single'
				value={selected}
				onValueChange={setSelected}>
				<ToggleGroupItem
					value='veg'
					className={cn(compactMode && 'text-xs py-0')}>
					<FoodCategoryIconMapper type='veg' />
					{!iconsOnly ? (compactMode ? 'Veg' : 'Vegetable') : ''}
				</ToggleGroupItem>
				<ToggleGroupItem
					value='meat'
					className={cn(compactMode && 'text-xs')}>
					<FoodCategoryIconMapper type='meat' />
					{!iconsOnly && 'Meat'}
				</ToggleGroupItem>
				<ToggleGroupItem
					value='fruit'
					className={cn(compactMode && 'text-xs')}>
					<FoodCategoryIconMapper type='fruit' />
					{!iconsOnly && 'Fruit'}
				</ToggleGroupItem>
				<ToggleGroupItem
					value='grain'
					className={cn(compactMode && 'text-xs')}>
					<FoodCategoryIconMapper type='grain' />
					{!iconsOnly && 'Grain'}
				</ToggleGroupItem>
				<ToggleGroupItem
					value='legume'
					className={cn(compactMode && 'text-xs')}>
					<FoodCategoryIconMapper type='legume' />
					{!iconsOnly ? (compactMode ? 'Leg' : 'Legume') : ''}
				</ToggleGroupItem>
				<ToggleGroupItem
					value='nutSeed'
					className={cn(compactMode && 'text-xs')}>
					<FoodCategoryIconMapper type='nutSeed' />
					{!iconsOnly && 'Nuts'}
				</ToggleGroupItem>
				<ToggleGroupItem
					value='other'
					className={cn(compactMode && 'text-xs')}>
					<FoodCategoryIconMapper type='other' />
					{!iconsOnly && 'Other'}
				</ToggleGroupItem>
				{user && !suppressUser && (
					<ToggleGroupItem
						value='user'
						className={cn(compactMode && 'text-xs')}>
						<Avatar className='w-6 h-6'>
							<AvatarImage src={user.image} />
							<AvatarFallback>{user.name.slice(0, 1)}</AvatarFallback>
						</Avatar>
					</ToggleGroupItem>
				)}
			</ToggleGroup>
		</div>
	);
}

'use client';

import {
	allSearch,
	categorySearch,
	favouriteSearch,
	selectFoodSearchStatus,
	userSearch
} from '@/lib/features/food/foodSearchSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { cn } from '@/lib/utils';
import { GetUser } from '@/types';
import { FilterX } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { BsBookmarkStarFill } from 'react-icons/bs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import FoodCategoryIconMapper from './food-category-icon-mapper';

export default function FoodCategoryPicker({
	value = '',
	onSelect,
	compactMode = false,
	showFilterIcon = false,
	iconsOnly = false,
	suppressUser = false,
	disableReduxDispatch = false,
	searchOnly = true
}: {
	onSelect: (data: string) => void;
	value?: string;
	compactMode?: boolean;
	showFilterIcon?: boolean;
	iconsOnly?: boolean;
	suppressUser?: boolean;
	disableReduxDispatch?: boolean;
	searchOnly?: boolean;
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
							const userClone = {
								...user,
								name: 'you'
							};
							dispatch(userSearch(JSON.stringify(userClone)));
						}
						break;
					case 'favourites':
						dispatch(favouriteSearch());
						break;
					case 'all':
						dispatch(allSearch());
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
			<ToggleGroup
				size='sm'
				className={cn(
					'flex flex-row gap-x-1 gap-y-0 flex-wrap',
					compactMode && 'gap-0'
				)}
				type='single'
				defaultValue={selected}
				onValueChange={setSelected}>
				{showFilterIcon && (
					<ToggleGroupItem
						value='all'
						className={cn(compactMode && 'text-xs py-0')}>
						<FilterX className='w-4 h-4' />
					</ToggleGroupItem>
				)}
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
				{searchOnly && (
					<ToggleGroupItem
						value='favourites'
						className={cn(compactMode && 'text-xs')}>
						<BsBookmarkStarFill className='text-teal-600 w-4 h-4' />
					</ToggleGroupItem>
				)}
			</ToggleGroup>
		</div>
	);
}

export const getFoodCategoryConstants = (cat: string): string => {
	const catMap = new Map<string, string>([
		['veg', 'Vegetable'],
		['meat', 'Meat'],
		['fruit', 'Fruit'],
		['grain', 'Grain'],
		['legume', 'Legume'],
		['nutSeed', 'Seed & Nut'],
		['other', 'Miscellaneous']
	]);

	return catMap.get(cat) || '';
};

'use client';

import { useContext, useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import { cn } from '@/lib/utils';
import { FilterX } from 'lucide-react';
import { Button } from '../ui/button';
import {
	FoodContextSearchType,
	FoodSearchContext
} from '@/contexts/food-search-context';

export default function FoodCategoryPicker({
	value = '',
	onSelect,
	compactMode = false,
	showFilterIcon = false,
	iconsOnly = false
}: {
	onSelect: (data: string) => void;
	value?: string;
	compactMode?: boolean;
	showFilterIcon?: boolean;
	iconsOnly?: boolean;
}) {
	const [selected, setSelected] = useState(value);
	const foodContext = useContext(FoodSearchContext);

	useEffect(() => {
		onSelect(selected);

		if (foodContext && foodContext.updateSearchType) {
			const update = {
				...foodContext,
				searchType:
					selected !== '' ? ('category' as FoodContextSearchType) : null
			};

			foodContext.updateSearchType(update);
		}
	}, [selected]);

	useEffect(() => {
		if (foodContext && foodContext.searchType === 'input') {
			setSelected('');
		}
	}, [foodContext]);

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
					onClick={() => {
						setSelected('');
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
			</ToggleGroup>
		</div>
	);
}

'use client';

import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import FoodCategoryIconMapper from './food-category-icon-mapper';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';
import { Filter } from 'lucide-react';

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

	useEffect(() => {
		if (selected) {
			onSelect(selected);
		}
	}, [selected]);

	return (
		<div
			className={cn(
				'flex flex-row gap-1 p-1 rounded-md border-2',
				compactMode && 'border-0 p-0 gap-0'
			)}>
			{showFilterIcon && (
				<Badge variant='outline'>
					<Filter className='w-4 h-4' />
				</Badge>
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

'use client';

import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';
import FoodCategoryIconMapper from './food-category-icon-mapper';

export default function FoodCategoryPicker({
	value = '',
	onSelect
}: {
	onSelect: (data: string) => void;
	value?: string;
}) {
	const [selected, setSelected] = useState(value);

	useEffect(() => {
		if (selected) {
			onSelect(selected);
		}
	}, [selected]);

	return (
		<div className='flex flex-row gap-2 flex-wrap p-2 rounded-md border-2'>
			<ToggleGroup
				className='flex flex-row gap-x-2 gap-y-0 flex-wrap'
				type='single'
				value={selected}
				onValueChange={setSelected}>
				<ToggleGroupItem value='veg'>
					<FoodCategoryIconMapper type='veg' />
					Vegetable
				</ToggleGroupItem>
				<ToggleGroupItem value='meat'>
					<FoodCategoryIconMapper type='meat' />
					Meat
				</ToggleGroupItem>
				<ToggleGroupItem value='fruit'>
					<FoodCategoryIconMapper type='fruit' />
					Fruit
				</ToggleGroupItem>
				<ToggleGroupItem value='grain'>
					<FoodCategoryIconMapper type='grain' />
					Grain
				</ToggleGroupItem>
				<ToggleGroupItem value='legume'>
					<FoodCategoryIconMapper type='legume' />
					Legume
				</ToggleGroupItem>
				<ToggleGroupItem value='nutSeed'>
					<FoodCategoryIconMapper type='nutSeed' />
					Nuts
				</ToggleGroupItem>
				<ToggleGroupItem value='other'>
					<FoodCategoryIconMapper type='other' />
					Other
				</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}

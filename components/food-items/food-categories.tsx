'use client';

import { useEffect, useState } from 'react';
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

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
				type='single'
				value={selected}
				onValueChange={setSelected}>
				<ToggleGroupItem value='veg'>Vegetable</ToggleGroupItem>
				<ToggleGroupItem value='meat'>Meat</ToggleGroupItem>
				<ToggleGroupItem value='fruit'>Fruit</ToggleGroupItem>
				<ToggleGroupItem value='grain'>Grain</ToggleGroupItem>
				<ToggleGroupItem value='legume'>Legume</ToggleGroupItem>
				<ToggleGroupItem value='other'>Other</ToggleGroupItem>
			</ToggleGroup>
		</div>
	);
}

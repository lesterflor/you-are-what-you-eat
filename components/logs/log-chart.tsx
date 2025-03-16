'use client';

import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent
} from '@/components/ui/chart';

import { type ChartConfig } from '@/components/ui/chart';
import { FoodEntry, GetLog } from '@/types';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const chartConfig = {
	calories: {
		label: 'Calories',
		color: 'hsl(var(--chart-1))'
	},
	carb: {
		label: 'Carbs',
		color: 'hsl(var(--chart-2))'
	},
	protein: {
		label: 'Protein',
		color: 'hsl(var(--chart-4))'
	},
	fat: {
		label: 'Fat',
		color: 'hsl(var(--chart-3))'
	}
} satisfies ChartConfig;

type LogDataType = {
	eatenAt: string;
	calories: number;
	carb: number;
	protein: number;
	fat: number;
};

export function LogChart({ log }: { log: GetLog }) {
	const [logData, setLogData] = useState<LogDataType[]>();

	useEffect(() => {
		if (log.foodItems.length > 0) {
			const dataMap = log.foodItems.map((item: FoodEntry) => ({
				calories: item.calories,
				carb: item.carbGrams,
				protein: item.proteinGrams,
				fat: item.fatGrams,
				eatenAt: format(item.eatenAt, 'h:mm a')
			}));

			setLogData(dataMap);
		}
	}, []);

	return (
		<ChartContainer
			config={chartConfig}
			className='min-h-[200px] w-full'>
			<BarChart data={logData}>
				<CartesianGrid vertical={false} />
				<XAxis
					className='text-xs'
					dataKey='eatenAt'
					tickLine={false}
					tickMargin={10}
					axisLine={false}
					orientation='bottom'
					//tickFormatter={(value) => value.slice(0, 3)}
				/>
				<ChartTooltip content={<ChartTooltipContent />} />
				<ChartLegend content={<ChartLegendContent />} />
				{/* <Bar
					dataKey='calories'
					fill='var(--color-calories)'
					radius={4}
				/> */}
				<Bar
					dataKey='carb'
					fill='var(--color-carb)'
					radius={4}
				/>
				<Bar
					dataKey='protein'
					fill='var(--color-protein)'
					radius={4}
				/>
				<Bar
					dataKey='fat'
					fill='var(--color-fat)'
					radius={4}
				/>
			</BarChart>
		</ChartContainer>
	);
}

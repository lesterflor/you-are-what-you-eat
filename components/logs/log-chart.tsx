'use client';

import {
	Bar,
	CartesianGrid,
	ComposedChart,
	Line,
	XAxis,
	YAxis
} from 'recharts';
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
import { ToggleGroup, ToggleGroupItem } from '../ui/toggle-group';

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
	totalGrams: number;
};

export function LogChart({
	log,
	chartType = 'macros'
}: {
	log: GetLog;
	chartType?: 'macros' | 'calories';
}) {
	const [logData, setLogData] = useState<LogDataType[]>();
	const [type, setType] = useState(chartType as string);

	useEffect(() => {
		if (log.foodItems.length > 0) {
			const dataMap = log.foodItems.map((item: FoodEntry) => ({
				calories: item.calories,
				carb: item.carbGrams,
				protein: item.proteinGrams,
				fat: item.fatGrams,
				eatenAt: format(item.eatenAt, 'h:mm a'),
				totalGrams: item.carbGrams + item.fatGrams + item.proteinGrams
			}));

			setLogData(dataMap);
		}
	}, []);

	return (
		<div className='flex flex-col gap-2'>
			<div>
				<ToggleGroup
					type='single'
					onValueChange={setType}
					defaultValue={type}>
					<ToggleGroupItem value='macros'>Macros</ToggleGroupItem>
					<ToggleGroupItem value='calories'>Calories</ToggleGroupItem>
				</ToggleGroup>
			</div>
			<ChartContainer
				config={chartConfig}
				className='min-h-[200px] w-full mr-4'>
				<ComposedChart
					data={logData}
					barSize={5}
					compact={false}
					layout='horizontal'>
					<CartesianGrid vertical={false} />
					<XAxis
						angle={-70}
						className='text-xs'
						dataKey='eatenAt'
						tickLine={false}
						tickMargin={25}
						axisLine={false}
						//tickFormatter={(value) => value.slice(0, 3)}
					/>

					<YAxis
						dataKey={type === 'macros' ? 'totalGrams' : 'calories'}
						tickLine={false}
						tickMargin={10}
						axisLine={false}
						label={{
							value: type === 'macros' ? 'Total grams' : 'Calories',
							angle: -90,
							position: 'insideLeft'
						}}
					/>
					<ChartTooltip content={<ChartTooltipContent />} />
					<ChartLegend
						className='mt-4'
						content={<ChartLegendContent />}
					/>
					{type === 'macros' ? (
						<>
							<Bar
								dataKey='carb'
								fill='var(--color-carb)'
								radius={2}
							/>
							<Bar
								dataKey='protein'
								fill='var(--color-protein)'
								radius={2}
							/>
							<Bar
								dataKey='fat'
								fill='var(--color-fat)'
								radius={2}
							/>
						</>
					) : (
						<>
							<Line
								type='monotone'
								dataKey='calories'
								stroke='#ff7300'
							/>
						</>
					)}
				</ComposedChart>
			</ChartContainer>
		</div>
	);
}

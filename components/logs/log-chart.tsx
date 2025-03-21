'use client';

import {
	Bar,
	CartesianGrid,
	Cell,
	ComposedChart,
	Line,
	Pie,
	PieChart,
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
import { formatUnit, GRAMS_TO_POUND, totalMacrosReducer } from '@/lib/utils';
import { Weight } from 'lucide-react';
import { Badge } from '../ui/badge';

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
	const [pieData, setPieData] = useState<PieItemType[]>([]);
	const [totalGrams, setTotalGrams] = useState(0);

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

			setTotalGrams(
				log.foodItems.reduce(
					(acc, curr) =>
						acc + curr.carbGrams + curr.proteinGrams + curr.fatGrams,
					0
				)
			);

			const { carbs, protein, fat } = totalMacrosReducer(log.foodItems);

			setPieData([
				{ name: 'Carbs', value: carbs },
				{ name: 'Protein', value: protein },
				{ name: 'Fat', value: fat }
			]);
		}
	}, []);

	return (
		<div className='flex flex-col gap-2 justify-start items-start h-full'>
			<div className='w-full text-center'>
				<ToggleGroup
					type='single'
					onValueChange={setType}
					defaultValue={type}>
					<ToggleGroupItem value='macros'>Macros</ToggleGroupItem>
					<ToggleGroupItem value='calories'>Calories</ToggleGroupItem>
					<ToggleGroupItem value='totals'>Macro Percentages</ToggleGroupItem>
				</ToggleGroup>
			</div>

			{type === 'totals' ? (
				<div className='h-full w-full flex flex-col items-center justify-between'>
					<div className='flex flex-row items-center gap-2 flex-wrap text-xs mt-2'>
						<Weight className='w-6 h-6' />
						Total weight:
						<Badge
							variant='outline'
							className='p-2 font-normal'>
							{formatUnit(totalGrams)} grams
						</Badge>{' '}
						or{' '}
						<Badge
							variant='outline'
							className='p-2 font-normal'>
							{formatUnit(totalGrams * GRAMS_TO_POUND)} pounds
						</Badge>
						of food
					</div>
					<ChartContainer
						config={pieChartConfig}
						className='min-h-[45vh] portrait:h-[75vh] portrait:w-[80vw]'>
						<PieChart>
							<Pie
								data={pieData}
								cx='50%'
								cy='50%'
								labelLine={false}
								label={(value) => renderCustomizedLabel(value)}
								outerRadius={140}
								fill='#8884d8'
								dataKey='value'>
								{pieData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>

							<ChartTooltip
								formatter={(value, name, props) => (
									<div className='flex flex-row items-center gap-2'>
										<div
											className='w-2 h-2 rounded-sm'
											style={{
												backgroundColor: `${props.payload.fill}`
											}}></div>
										<div>{name}</div>
										<div className='text-xs'>
											{formatUnit(Number(value))} grams
										</div>
									</div>
								)}
								content={<ChartTooltipContent />}
							/>
						</PieChart>
					</ChartContainer>
				</div>
			) : (
				<>
					<div className='hidden portrait:block'>
						<ChartContainer
							config={chartConfig}
							className='min-h-[200px] portrait:h-[75vh] portrait:w-[85vw] mr-4'>
							<ComposedChart
								data={logData}
								barSize={5}
								compact={false}
								margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
								layout='vertical'>
								<CartesianGrid vertical={true} />
								<YAxis
									width={72}
									className='text-xs'
									dataKey='eatenAt'
									tickLine={false}
									tickMargin={1}
									axisLine={false}
									type='category'
								/>

								<XAxis
									type='number'
									label={{
										value: type === 'macros' ? 'Total grams' : 'Calories',
										position: 'bottom'
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
											stackId='a'
										/>
										<Bar
											dataKey='protein'
											fill='var(--color-protein)'
											radius={2}
											stackId='b'
										/>
										<Bar
											dataKey='fat'
											fill='var(--color-fat)'
											radius={2}
											stackId='c'
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

					<div className='portrait:hidden w-full h-full'>
						<ChartContainer
							config={chartConfig}
							className='min-h-[200px] h-[50vh] w-[60vw] mr-4'>
							<ComposedChart
								height={800}
								data={logData}
								barSize={5}
								compact={false}
								margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
								layout='horizontal'>
								<CartesianGrid vertical={false} />
								<XAxis
									angle={-90}
									className='text-xs'
									dataKey='eatenAt'
									tickLine={false}
									tickMargin={25}
									offset={10}
									axisLine={false}
									type='category'
								/>

								<YAxis
									type='number'
									offset={0}
									tickMargin={5}
									label={{
										value: type === 'macros' ? 'Total grams' : 'Calories',
										position: 'insideLeft',
										angle: -90
									}}
									width={55}
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
				</>
			)}
		</div>
	);
}

const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({
	cx,
	cy,
	midAngle,
	innerRadius,
	outerRadius,
	percent
}: {
	cx: number;
	cy: number;
	midAngle: number;
	innerRadius: number;
	outerRadius: number;
	percent: number;
	value: number;
	name: string;
}) => {
	const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);

	return (
		<text
			x={x}
			y={y}
			fill='white'
			textAnchor={x > cx ? 'start' : 'end'}
			dominantBaseline='central'>
			<tspan dy='1.2em'>{`${formatUnit(percent * 100)}%`}</tspan>
		</text>
	);
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

type PieItemType = {
	name: string;
	value: number;
};

const pieChartConfig = {
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

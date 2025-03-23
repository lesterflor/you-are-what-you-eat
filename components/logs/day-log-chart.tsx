'use client';

import { DayLogDataType } from '@/types';
import React, { useEffect, useState } from 'react';
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '../ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { formatUnit } from '@/lib/utils';

export default function DayLogChart({ data }: { data: DayLogDataType[] }) {
	const [logs, setLogs] = useState<DayLogDataType[]>([]);
	const [dates, setDates] = useState({
		earliest: '',
		latest: ''
	});

	useEffect(() => {
		setLogs(data.reverse());
	}, []);

	useEffect(() => {
		if (logs.length > 1) {
			const first = logs.at(0)?.day ?? '';
			const last = logs.at(-1)?.day ?? '';
			setDates({ earliest: first, latest: last });
		}
	}, [logs]);

	return (
		<div className='flex flex-col gap-4'>
			<div>
				Showing data for {dates.earliest} - {dates.latest}
			</div>

			<div>
				<div>Calories</div>
				<ChartContainer
					config={caloriesConfig}
					className='h-[65vh] w-full'>
					<AreaChart
						accessibilityLayer
						data={logs}
						margin={{
							left: 12,
							right: 12
						}}>
						<CartesianGrid vertical={false} />
						<XAxis
							angle={-90}
							className='text-xs'
							dataKey='day'
							tickLine={true}
							tickMargin={65}
							offset={10}
							axisLine={true}
							type='category'
							height={150}
						/>

						<YAxis
							type='number'
							offset={0}
							tickCount={20}
							tickLine={true}
							tickMargin={5}
							label={{
								value: 'Calories',
								position: 'insideLeft',
								angle: -90
							}}
							width={65}
						/>

						<ChartTooltip
							cursor={false}
							formatter={(value, name, props) => (
								<div className='flex flex-row items-start justify-center gap-2'>
									<div>{props.payload.name}</div>
									<div
										className='w-3 h-3 rounded-sm'
										style={{
											backgroundColor: `${props.color}`
										}}></div>
									<div className='text-xs'>
										{name}{' '}
										<span className='font-semibold'>
											{formatUnit(Number(value))}
										</span>{' '}
									</div>
								</div>
							)}
							content={<ChartTooltipContent />}
						/>

						<defs>
							<linearGradient
								id='fillCalories'
								x1='0'
								y1='0'
								x2='0'
								y2='1'>
								<stop
									offset='5%'
									stopColor='var(--color-calories)'
									stopOpacity={0.8}
								/>
								<stop
									offset='95%'
									stopColor='var(--color-calories)'
									stopOpacity={0.1}
								/>
							</linearGradient>

							<linearGradient
								id='fillCaloriesBurned'
								x1='0'
								y1='0'
								x2='0'
								y2='1'>
								<stop
									offset='5%'
									stopColor='var(--color-day)'
									stopOpacity={0.8}
								/>
								<stop
									offset='95%'
									stopColor='var(--color-day)'
									stopOpacity={0.1}
								/>
							</linearGradient>
						</defs>

						<Area
							dataKey='Expended'
							type='natural'
							fill='url(#fillCaloriesBurned)'
							fillOpacity={0.4}
							stroke='var(--color-day)'
						/>

						<Area
							dataKey='Calories'
							type='natural'
							fill='url(#fillCalories)'
							fillOpacity={0.4}
							stroke='var(--color-calories)'
						/>
					</AreaChart>
				</ChartContainer>
			</div>

			{/* {logs.map((item) => (
				<div key={item.day.toDateString()}>
					<div>{format(item.day, 'PP')}</div>
					<div>{item.calories}</div>
					<div>{item.carb}</div>
					<div>{item.protein}</div>
					<div>{item.fat}</div>
					<div>{item.totalGrams}</div>
					<div>{item.caloriesBurned}</div>
					<br />
				</div>
			))} */}
		</div>
	);
}

const caloriesConfig = {
	day: {
		label: 'Day',
		color: 'hsl(var(--chart-1))'
	},
	calories: {
		label: 'Calories',
		color: 'hsl(var(--chart-2))'
	}
} satisfies ChartConfig;

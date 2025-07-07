'use client';

import { getUserLogsInRange } from '@/actions/log-actions';
import { cn, formatUnit } from '@/lib/utils';
import { DayLogDataType } from '@/types';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { DateRange } from 'react-day-picker';
import { ImSpinner2 } from 'react-icons/im';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import {
	ChartConfig,
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent
} from '../ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export default function DayLogChart() {
	const [logs, setLogs] = useState<DayLogDataType[]>([]);

	const [date, setDate] = useState<DateRange | undefined>({
		from: new Date(2025, 2, 12),
		to: new Date(Date.now())
	});

	const [isFetching, setIsFetching] = useTransition();
	const [datePickerOpen, setDatePickerOpen] = useState(false);

	const getLogs = () => {
		setIsFetching(async () => {
			if (!date || !date.from || !date.to) {
				return;
			}

			const res = await getUserLogsInRange(date.from, date.to);

			if (res.success && res.data) {
				const mapData: DayLogDataType[] = res.data.map((log) => ({
					day: format(log.createdAt, 'eee P'),
					Expended:
						log.knownCaloriesBurned && log.knownCaloriesBurned.length > 0
							? log.knownCaloriesBurned[0].calories +
							  log.user.BaseMetabolicRate[0].bmr
							: log.user.BaseMetabolicRate[0].bmr,
					Calories: log.foodItems.reduce((acc, curr) => acc + curr.calories, 0),
					carb: log.foodItems.reduce((acc, curr) => acc + curr.carbGrams, 0),
					protein: log.foodItems.reduce(
						(acc, curr) => acc + curr.proteinGrams,
						0
					),
					fat: log.foodItems.reduce((acc, curr) => acc + curr.fatGrams, 0),
					totalGrams: log.foodItems.reduce(
						(acc, curr) =>
							acc + curr.fatGrams + curr.carbGrams + curr.proteinGrams,
						0
					)
				}));

				setLogs(mapData);
			}
		});
	};

	useEffect(() => {
		getLogs();
		if (date?.from && date?.to) {
			setDatePickerOpen(false);
		}
	}, [date]);

	return (
		<>
			<div>
				<Popover
					open={datePickerOpen}
					onOpenChange={setDatePickerOpen}>
					<PopoverTrigger asChild>
						<div className='flex flex-col items-center gap-1'>
							<Button
								variant={'secondary'}
								id='date'
								className={cn(
									'justify-start text-left font-normal',
									!date && 'text-muted-foreground'
								)}>
								<CalendarIcon />
								{date?.from ? (
									date.to ? (
										<>
											{format(date.from, 'LLL dd, y')} -{' '}
											{format(date.to, 'LLL dd, y')}
										</>
									) : (
										format(date.from, 'LLL dd, y')
									)
								) : (
									<span>Pick a date</span>
								)}
							</Button>
							<div className='text-xs text-muted-foreground'>
								Select a date range to refine your data
							</div>
						</div>
					</PopoverTrigger>
					<PopoverContent
						className='w-auto p-0'
						align='start'>
						<Calendar
							hideHead={true}
							classNames={{
								day: 'w-7 h-7 text-xs rounded-sm',
								row: 'flex w-full mt-1'
							}}
							initialFocus
							mode='range'
							defaultMonth={date?.from}
							selected={date}
							onSelect={setDate}
							numberOfMonths={2}
						/>
					</PopoverContent>
				</Popover>
			</div>

			{isFetching ? (
				<div className='w-full h-full flex flex-col items-center justify-center'>
					<ImSpinner2 className='w-40 h-40 animate-spin opacity-5' />
				</div>
			) : (
				<>
					<div className='flex flex-col gap-4 w-fit h-full'>
						<div>
							<div>Calories</div>
							{/* portrait chart */}
							<ChartContainer
								config={caloriesConfig}
								className='hidden portrait:block h-[65vh] w-[85vw]'>
								<AreaChart
									layout='vertical'
									accessibilityLayer
									data={logs}
									margin={{
										left: 0,
										right: 0
									}}>
									<CartesianGrid vertical={false} />
									<YAxis
										className='text-xs'
										dataKey='day'
										tickLine={true}
										tickMargin={0}
										offset={10}
										axisLine={true}
										type='category'
										width={72}
									/>

									<XAxis
										type='number'
										offset={0}
										tickCount={20}
										tickLine={true}
										tickMargin={10}
										label='Calories'
										height={65}
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
													{name === 'Calories' ? 'Consumed' : name}{' '}
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

							{/* desktop chart */}
							<ChartContainer
								config={caloriesConfig}
								className='h-[65vh] w-[60vw] portrait:hidden'>
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
													{name === 'Calories' ? 'Consumed' : name}{' '}
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
				</>
			)}
		</>
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

'use client';

import { createDailyLog } from '@/actions/log-actions';
import { pieChartConfig } from '@/config';
import { selectData, selectStatus } from '@/lib/features/log/logFoodSlice';
import { useAppSelector } from '@/lib/hooks';
import {
	formatUnit,
	getMacroPercOfCals,
	RADIAN,
	totalMacrosReducer
} from '@/lib/utils';
import { GetFoodEntry, GetLog, LogComparisonType, PieItemType } from '@/types';
import { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { Label, Pie, PieChart } from 'recharts';
import LogMacrosSkeleton from '../skeletons/log-macros-skeleton';
import { Badge } from '../ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import ComparisonPopover from './comparison-popover';

export default function LogMacrosSummary({
	log,
	children,
	compactMode = false,
	getTodayMode = true,
	detailedMode = false,
	useSkeleton = false,
	showPie = false
}: {
	log?: GetLog;
	children?: React.ReactNode;
	compactMode?: boolean;
	getTodayMode?: boolean;
	detailedMode?: boolean;
	useSkeleton?: boolean;
	showPie?: boolean;
}) {
	const [isFetching, setIsFetching] = useState(false);

	const [revealPie, setRevealPie] = useState(false);
	const [pieData, setPieData] = useState<PieItemType[]>([]);
	const [comparisonData, setComparisonData] = useState<LogComparisonType>(null);

	const [currentData, setCurrentData] = useState({
		calories: 0,
		carbs: 0,
		fat: 0,
		protein: 0,
		totalGrams: 0
	});

	const logStatus = useAppSelector(selectStatus);
	const logData = useAppSelector(selectData);

	useEffect(() => {
		if (log) {
			const { calories, carbs, protein, fat } = totalMacrosReducer(
				log.foodItems
			);

			setCurrentData({
				calories,
				carbs,
				protein,
				fat,
				totalGrams: carbs + protein + fat
			});

			setPieData([
				{ name: 'Carbs', value: carbs, fill: 'var(--color-carb)' },
				{ name: 'Protein', value: protein, fill: 'var(--color-protein)' },
				{ name: 'Fat', value: fat, fill: 'var(--color-fat)' }
			]);

			setComparisonData(log.comparisons);
		}
	}, []);

	useEffect(() => {
		setTimeout(() => {
			setRevealPie(true);
		}, 2000);
	}, [pieData]);

	const getLog = async () => {
		setIsFetching(true);
		const res = await createDailyLog(getTodayMode);

		if (res?.success && res.data) {
			const { foodItems, comparisons } = res.data;
			const items = foodItems as GetFoodEntry[];

			const { calories, carbs, protein, fat } = totalMacrosReducer(items);

			setCurrentData({
				calories,
				carbs,
				protein,
				fat,
				totalGrams: carbs + protein + fat
			});

			setPieData([
				{ name: 'Carbs', value: carbs, fill: 'var(--color-carb)' },
				{ name: 'Protein', value: protein, fill: 'var(--color-protein)' },
				{ name: 'Fat', value: fat, fill: 'var(--color-fat)' }
			]);

			setComparisonData(comparisons);
		}
		setIsFetching(false);
	};

	useEffect(() => {
		if (getTodayMode) {
			getLog();
		}
	}, [logStatus, logData]);

	return (
		<div className='flex portrait:flex-col flex-row gap-2'>
			{compactMode ? (
				isFetching && useSkeleton ? (
					<LogMacrosSkeleton detailedMode={detailedMode} />
				) : (
					<div className='flex flex-col gap-1'>
						<div className='text-xs'>{children}</div>
						<div className='flex flex-row flex-wrap gap-2 portrait:gap-1'>
							<Badge className='p-1 text-xs w-14'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal'>Calories</div>
									<div className='flex flex-row items-center gap-0'>
										{currentData.calories > 0 && comparisonData && (
											<ComparisonPopover
												data={comparisonData}
												field='calories'
												value={formatUnit(currentData.calories)}
											/>
										)}
									</div>
								</div>
							</Badge>

							<Badge className='p-1 text-xs w-14'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal whitespace-nowrap'>Protein g</div>
									<div className='flex flex-row items-center gap-0'>
										{currentData.protein > 0 && comparisonData && (
											<ComparisonPopover
												data={comparisonData}
												field='protein'
												value={formatUnit(currentData.protein)}
											/>
										)}
									</div>
								</div>
							</Badge>

							<Badge className='p-1 text-xs w-14'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal whitespace-nowrap'>Carb g</div>
									<div className='flex flex-row items-center gap-0'>
										{currentData.carbs > 0 && comparisonData && (
											<ComparisonPopover
												data={comparisonData}
												field='carbs'
												value={formatUnit(currentData.carbs)}
											/>
										)}
									</div>
								</div>
							</Badge>

							<Badge className='p-1 text-xs w-14'>
								<div className='flex flex-col items-center w-full'>
									<div className='font-normal whitespace-nowrap'>Fat g</div>
									<div className='flex flex-row items-center gap-0'>
										{currentData.fat > 0 && comparisonData && (
											<ComparisonPopover
												data={comparisonData}
												field='fat'
												value={formatUnit(currentData.fat)}
											/>
										)}
									</div>
								</div>
							</Badge>
						</div>

						{detailedMode && (
							<div className='flex flex-col gap-2 text-xs'>
								<br />
								<div className='col-span-2 font-semibold text-md'>
									Calories breakdown
								</div>

								<div className='flex flex-row items-center gap-2 flex-wrap'>
									<div className='flex flex-col items-center gap-0 rounded-md border-2 p-1'>
										<span className='text-muted-foreground'>Carbohydrates</span>
										<div className='flex flex-row items-center gap-1'>
											<span>{formatUnit(currentData.carbs * 4)}</span>
											<span className='text-muted-foreground'>
												(
												{getMacroPercOfCals(
													currentData.carbs,
													currentData.calories,
													'carb'
												)}
												)
											</span>
										</div>
									</div>
									<div className='flex flex-col items-center gap-0 rounded-md border-2 p-1'>
										<span className='text-muted-foreground'>Fat</span>
										<div className='flex flex-row items-center gap-1'>
											<span>{formatUnit(currentData.fat * 9)}</span>
											<span className='text-muted-foreground'>
												(
												{getMacroPercOfCals(
													currentData.fat,
													currentData.calories,
													'fat'
												)}
												)
											</span>
										</div>
									</div>

									<div className='flex flex-col items-center gap-0 rounded-md border-2 p-1'>
										<span className='text-muted-foreground'>Protein</span>{' '}
										<div className='flex flex-row items-center gap-1'>
											<span>{formatUnit(currentData.protein * 4)}</span>
											<span className='text-muted-foreground'>
												(
												{getMacroPercOfCals(
													currentData.protein,
													currentData.calories,
													'protein'
												)}
												)
											</span>
										</div>
									</div>
								</div>
							</div>
						)}
					</div>
				)
			) : isFetching && useSkeleton ? (
				<LogMacrosSkeleton detailedMode={detailedMode} />
			) : (
				<div className='flex flex-col gap-4'>
					<div className='flex flex-row flex-wrap gap-2 items-start justify-start'>
						<Badge className='p-2 text-md'>
							<div className='flex flex-col items-center w-full'>
								<div className='font-normal'>Calories</div>
								<div>{formatUnit(currentData.calories)}</div>
							</div>
						</Badge>
						<Badge className='p-2 text-md'>
							<div className='flex flex-col items-center w-full'>
								<div className='font-normal'>Protein</div>
								<div>{formatUnit(currentData.protein)} g</div>
							</div>
						</Badge>
						<Badge className='p-2 text-md'>
							<div className='flex flex-col items-center w-full'>
								<div className='font-normal'>Carbs</div>
								<div>{formatUnit(currentData.carbs)} g</div>
							</div>
						</Badge>
						<Badge className='p-2 text-md'>
							<div className='flex flex-col items-center w-full'>
								<div className='font-normal'>Fat</div>
								<div>{formatUnit(currentData.fat)} g</div>
							</div>
						</Badge>
					</div>

					{detailedMode && (
						<div className='flex flex-col gap-2 text-xs'>
							<div className='col-span-2 font-semibold text-lg'>
								Calories breakdown
							</div>

							<div className='flex flex-row items-center gap-2 flex-wrap'>
								<div className='flex flex-col items-center gap-0 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Carbohydrates</span>
									<div className='flex flex-row items-center gap-1'>
										<span>{formatUnit(currentData.carbs * 4)}</span>
										<span className='text-muted-foreground'>
											(
											{getMacroPercOfCals(
												currentData.carbs,
												currentData.calories,
												'carb'
											)}
											)
										</span>
									</div>
								</div>
								<div className='flex flex-col items-center gap-0 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Fat</span>
									<div className='flex flex-row items-center gap-1'>
										<span>{formatUnit(currentData.fat * 9)}</span>
										<span className='text-muted-foreground'>
											(
											{getMacroPercOfCals(
												currentData.fat,
												currentData.calories,
												'fat'
											)}
											)
										</span>
									</div>
								</div>

								<div className='flex flex-col items-center gap-0 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Protein</span>{' '}
									<div className='flex flex-row items-center gap-1'>
										<span>{formatUnit(currentData.protein * 4)}</span>
										<span className='text-muted-foreground'>
											(
											{getMacroPercOfCals(
												currentData.protein,
												currentData.calories,
												'protein'
											)}
											)
										</span>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			)}

			{showPie && currentData.calories > 0 && (
				<div className='w-auto'>
					{!revealPie ? (
						<div className='w-full flex flex-col items-center justify-center portrait:h-[25vh]'>
							<FaSpinner className='w-20 h-20 animate-spin opacity-5' />
						</div>
					) : (
						<ChartContainer
							config={pieChartConfig}
							className='mx-auto aspect-square w-[35vw] md:w-[28vw] lg:w-[22vw] xl:w-[18vw] h-[25vh] min-h-[25vh] portrait:w-full portrait:h-[25vh]'>
							<PieChart>
								<ChartTooltip
									formatter={(value, name, props) => (
										<div className='flex flex-row items-center gap-2'>
											<div
												className='w-2 h-2 rounded-sm'
												style={{
													backgroundColor: `${props.payload.fill}`
												}}>
												{props.payload.color}
											</div>
											<div>{props.payload.name}</div>
											<div className='text-xs'>
												{formatUnit(Number(value))} grams
											</div>
										</div>
									)}
									cursor={false}
									content={<ChartTooltipContent />}
								/>
								<Pie
									data={pieData}
									dataKey='value'
									nameKey='name'
									labelLine={false}
									label={(value) => renderCustomizedLabel(value)}
									innerRadius={45}
									outerRadius={82}
									strokeWidth={1}>
									<Label
										content={({ viewBox }) => {
											if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
												return (
													<text
														x={viewBox.cx}
														y={viewBox.cy}
														textAnchor='middle'
														dominantBaseline='middle'>
														<tspan
															x={viewBox.cx}
															y={viewBox.cy}
															className='fill-foreground text-2xl font-bold'>
															{formatUnit(currentData.totalGrams)}
														</tspan>
														<tspan
															x={viewBox.cx}
															y={(viewBox.cy || 0) + 18}
															className='fill-muted-foreground'>
															Total grams
														</tspan>
													</text>
												);
											}
										}}
									/>
								</Pie>
							</PieChart>
						</ChartContainer>
					)}
				</div>
			)}
		</div>
	);
}

const renderCustomizedLabel = ({
	cx,
	cy,
	midAngle,
	innerRadius,
	outerRadius,
	percent,
	name
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
	const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
	const x = cx + radius * Math.cos(-midAngle * RADIAN);
	const y = cy + radius * Math.sin(-midAngle * RADIAN);

	return (
		<text
			x={x}
			y={y}
			fill='white'
			textAnchor={x > cx ? 'start' : 'end'}
			dominantBaseline='middle'>
			<tspan
				x={x}
				y={y}
				className='font-bold'>
				{name}
			</tspan>
			<tspan
				x={x}
				y={(y || 0) + 15}>
				{`${formatUnit(percent * 100)}%`}
			</tspan>
		</text>
	);
};

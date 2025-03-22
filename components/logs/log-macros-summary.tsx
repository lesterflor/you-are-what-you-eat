'use client';

import {
	formatUnit,
	getMacroPercOfCals,
	RADIAN,
	totalMacrosReducer
} from '@/lib/utils';
import { GetFoodEntry, GetLog, PieItemType } from '@/types';
import { useContext, useEffect, useState } from 'react';
import { Badge } from '../ui/badge';
import { createDailyLog } from '@/actions/log-actions';
import { LogUpdateContext } from '@/contexts/log-context';
import LogMacrosSkeleton from '../skeletons/log-macros-skeleton';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '../ui/chart';
import { Label, Pie, PieChart } from 'recharts';
import { pieChartConfig } from '@/config';

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
	const [totalCals, setTotalCals] = useState(0);
	const [totalCarbs, setTotalCarbs] = useState(0);
	const [totalFat, setTotalFat] = useState(0);
	const [totalProtein, setTotalProtein] = useState(0);
	const [totalGrams, setTotalGrams] = useState(0);
	const [isFetching, setIsFetching] = useState(false);

	const [pieData, setPieData] = useState<PieItemType[]>([]);

	const logContext = useContext(LogUpdateContext);

	useEffect(() => {
		if (log) {
			const { calories, carbs, protein, fat } = totalMacrosReducer(
				log.foodItems
			);

			setIsFetching(false);
			setTotalCals(calories);
			setTotalCarbs(carbs);
			setTotalFat(fat);
			setTotalProtein(protein);

			setTotalGrams(carbs + protein + fat);

			setPieData([
				{ name: 'Carbs', value: carbs, fill: 'var(--color-carb)' },
				{ name: 'Protein', value: protein, fill: 'var(--color-protein)' },
				{ name: 'Fat', value: fat, fill: 'var(--color-fat)' }
			]);
		}
	}, []);

	const getLog = async () => {
		setIsFetching(true);
		const res = await createDailyLog();

		if (res?.success && res.data && res.data.foodItems.length > 0) {
			const { foodItems } = res.data;
			const items = foodItems as GetFoodEntry[];
			setTotalCals(totalMacrosReducer(items).calories);
			setTotalCarbs(totalMacrosReducer(items).carbs);
			setTotalFat(totalMacrosReducer(items).fat);
			setTotalProtein(totalMacrosReducer(items).protein);
		}
		setIsFetching(false);
	};

	useEffect(() => {
		if (logContext?.updated && getTodayMode) {
			getLog();
		}
	}, [logContext]);

	return (
		<div className='flex portrait:flex-col flex-row gap-2'>
			{compactMode ? (
				isFetching && useSkeleton ? (
					<LogMacrosSkeleton detailedMode={detailedMode} />
				) : (
					<div className='flex flex-col gap-1'>
						<div className='text-xs'>{children}</div>
						<div className='flex flex-row flex-wrap gap-2'>
							<Badge className='p-1 text-xs'>
								Cals: {formatUnit(totalCals)}
							</Badge>
							<Badge className='p-1 text-xs'>
								Prot: {formatUnit(totalProtein)}g
							</Badge>
							<Badge className='p-1 text-xs'>
								Carb: {formatUnit(totalCarbs)}g
							</Badge>
							<Badge className='p-1 text-xs'>
								Fat: {formatUnit(totalFat)}g
							</Badge>
						</div>

						{detailedMode && (
							<div className='grid grid-cols-2 gap-2 text-xs'>
								<br />
								<div className='col-span-2 border-b-2 font-semibold text-lg'>
									Calories breakdown
								</div>
								<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Prot:</span>{' '}
									{formatUnit(totalProtein * 4)}
									<span className='text-muted-foreground'>
										{getMacroPercOfCals(totalProtein, totalCals, 'protein')}
									</span>
								</div>
								<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Carb:</span>{' '}
									{formatUnit(totalCarbs * 4)}
									<span className='text-muted-foreground'>
										{getMacroPercOfCals(totalCarbs, totalCals, 'carb')}
									</span>
								</div>
								<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
									<span className='text-muted-foreground'>Fat:</span>{' '}
									{formatUnit(totalFat * 4)}
									<span className='text-muted-foreground'>
										{getMacroPercOfCals(totalFat, totalCals, 'fat')}
									</span>
								</div>
							</div>
						)}
					</div>
				)
			) : isFetching && useSkeleton ? (
				<LogMacrosSkeleton detailedMode={detailedMode} />
			) : (
				<div className='flex flex-col gap-4'>
					<div className='flex flex-row flex-wrap gap-2'>
						<Badge className='p-2 text-md'>
							Calories: {formatUnit(totalCals)}
						</Badge>
						<Badge className='p-2 text-md'>
							Protein: {formatUnit(totalProtein)} g
						</Badge>
						<Badge className='p-2 text-md'>
							Carbs: {formatUnit(totalCarbs)} g
						</Badge>
						<Badge className='p-2 text-md'>Fat: {formatUnit(totalFat)} g</Badge>
					</div>

					{detailedMode && (
						<div className='grid grid-cols-2 gap-2 text-xs'>
							<br />
							<div className='col-span-2 border-b-2 font-semibold text-lg'>
								Calories breakdown
							</div>
							<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>Protein:</span>{' '}
								{formatUnit(totalProtein * 4)}
								<span className='text-muted-foreground'>
									{getMacroPercOfCals(totalProtein, totalCals, 'protein')}
								</span>
							</div>
							<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>Carbohydrates:</span>{' '}
								{formatUnit(totalCarbs * 4)}
								<span className='text-muted-foreground'>
									{getMacroPercOfCals(totalCarbs, totalCals, 'carb')}
								</span>
							</div>
							<div className='flex flex-row items-center gap-2 rounded-md border-2 p-1'>
								<span className='text-muted-foreground'>Fat:</span>{' '}
								{formatUnit(totalFat * 4)}
								<span className='text-muted-foreground'>
									{getMacroPercOfCals(totalFat, totalCals, 'fat')}
								</span>
							</div>
						</div>
					)}
				</div>
			)}

			{showPie && (
				<div className='w-auto'>
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
								outerRadius={85}
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
														{formatUnit(totalGrams)}
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

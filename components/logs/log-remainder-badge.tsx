'use client';

import {
	getLogRemainder,
	getLogRemainderByUserIdInRange
} from '@/actions/log-actions';
import { remainderConfig } from '@/config';
import { selectMacros, selectStatus } from '@/lib/features/log/logFoodSlice';
import { useAppSelector } from '@/lib/hooks';
import { formatUnit, totalMacrosReducer } from '@/lib/utils';
import { GetFoodEntry, GetLog, LogRemainderDataType } from '@/types';
import { format } from 'date-fns';
import { ArrowDown, ArrowUp, Info } from 'lucide-react';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { DateRange } from 'react-day-picker';
import { ImSpinner2 } from 'react-icons/im';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
	NameType,
	ValueType
} from 'recharts/types/component/DefaultTooltipContent';
import DateRangeChooser from '../date-range-chooser';
import { Badge } from '../ui/badge';
import {
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip
} from '../ui/chart';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';

export default function LogRemainderBadge() {
	const logMacros = useAppSelector(selectMacros);
	const logDataStatus = useAppSelector(selectStatus);

	const [logRemainder, setLogRemainder] = useState<LogRemainderDataType>();

	const [popOpen, setPopOpen] = useState(false);
	const [isFetching, setIsFetching] = useTransition();
	const [remainders, setRemainders] = useState<GetLog[]>();
	const [remainder, setRemainder] = useState(logMacros.caloriesRemaining ?? 0);
	const [remainderStr, setRemainderStr] = useState('');
	const [range, setRange] = useState<DateRange | undefined>();
	const [chartData, setChartData] = useState<
		{
			calories: number;
			createdAt: string;
		}[]
	>();

	useEffect(() => {
		getLogCalsRemaining();
	}, []);

	useEffect(() => {
		if (
			(logDataStatus === 'initial' ||
				logDataStatus === 'loggedCalories' ||
				logDataStatus === 'added' ||
				logDataStatus === 'updated' ||
				logDataStatus === 'deleted' ||
				logDataStatus === 'loggedDish') &&
			logMacros.caloriesRemainingCumulative
		) {
			getLogCalsRemaining();
			setRemainder(logMacros.caloriesRemainingCumulative);
		}
	}, [logMacros, logDataStatus]);

	useEffect(() => {
		if (!popOpen) {
			setRange(undefined);
			setChartData([]);
		}
	}, [popOpen]);

	useEffect(() => {
		if (range && range.from && range?.to) {
			fetchLogRemainder();
		} else {
			setChartData([]);
		}
	}, [range]);

	const getLogCalsRemaining = () => {
		setIsFetching(async () => {
			const res = await getLogRemainder();

			if (res.success && res.data) {
				setIsFetching(() => {
					setLogRemainder(res.data);
				});
			}
		});
	};

	useEffect(() => {
		if (remainders && remainders.length > 0) {
			const amt = remainders.reduce(
				(acc, curr) =>
					acc +
					curr.knownCaloriesBurned[0].calories +
					curr.user.BaseMetabolicRate[0].bmr -
					totalMacrosReducer(curr.foodItems as GetFoodEntry[]).calories,
				0
			);

			let phrase = '';
			const frmRemainder = formatUnit(amt / 1200);

			switch (true) {
				case frmRemainder === 1:
					phrase = 'pound lost';
					break;
				case frmRemainder === -1:
					phrase = 'pound gained';
					break;
				case frmRemainder > 1:
					phrase = 'pounds lost';
					break;
				case frmRemainder < 0:
					phrase = 'pounds gained';
					break;
				default:
					phrase = 'pounds lost';
			}

			setRemainderStr(phrase);
			setRemainder(amt);
		}
	}, [remainders]);

	const fetchLogRemainder = useCallback(async () => {
		if (range) {
			const res = await getLogRemainderByUserIdInRange(range);

			if (res.success && res.data) {
				setRemainders(res.data as GetLog[]);

				setChartData(
					res.data.map((item) => ({
						calories: formatUnit(
							item.knownCaloriesBurned[0].calories +
								item.user.BaseMetabolicRate[0].bmr -
								totalMacrosReducer(item.foodItems as GetFoodEntry[]).calories
						),
						createdAt: format(item.createdAt, 'P')
					}))
				);
			}
		}
	}, [range]);

	const CustomTooltip = ({
		active,
		payload
	}: {
		active?: boolean;
		payload?: { name: NameType; value: ValueType }[];
		label?: string;
	}) => {
		if (active && payload && payload.length) {
			return (
				<div className='bg-black p-2 rounded-md'>
					<div className='flex flex-row items-center justify-center gap-2'>
						<span className='label'>{Math.abs(+payload[0].value)}</span>
						<span>
							{Math.sign(+payload[0].value) === -1 ? (
								<ArrowUp className='text-red-600 w-4 h-4' />
							) : (
								<ArrowDown className='text-green-600 w-4 h-4' />
							)}
						</span>
					</div>

					<p className='label'>
						{Math.sign(+payload[0].value) === -1
							? 'calories over'
							: 'calories under'}
					</p>
				</div>
			);
		}

		return null;
	};

	const chartRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (chartData && chartRef.current) {
			chartRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}, [chartData]);

	return (
		<>
			{isFetching ? (
				<div className='flex flex-col items-center justify-center'>
					{/* <ImSpinner2 className='w-4 h-4 animate-spin opacity-25' /> */}
					<>
						{remainder && (
							<Badge
								variant='secondary'
								className='transition-opacity fade-in animate-in duration-1000 select-none p-1 rounded-md border-2 font-normal text-xs flex flex-row gap-1 items-start'>
								<ImSpinner2 className='w-4 h-4 animate-spin opacity-25' />
								<div className='flex flex-col gap-0'>
									<span className='whitespace-nowrap'>Cumulative</span>
									<div className='flex flex-row gap-1 items-center'>
										{Math.sign(formatUnit(remainder)) === -1 ? (
											<ArrowUp className='w-3 h-3 text-red-600 animate-bounce' />
										) : (
											<ArrowDown className='w-3 h-3 text-green-600 animate-bounce' />
										)}
										<span>{Math.abs(formatUnit(remainder))}</span>
									</div>
								</div>
							</Badge>
						)}
					</>
				</div>
			) : (
				logRemainder && (
					<Popover
						open={popOpen}
						onOpenChange={setPopOpen}>
						<PopoverTrigger>
							<Badge
								variant='secondary'
								className='select-none p-1 rounded-md border-2 font-normal text-xs flex flex-row gap-1 items-start'>
								<Info className='w-4 h-4' />
								<div className='flex flex-col gap-0'>
									<span className='whitespace-nowrap'>Cumulative</span>
									<div className='flex flex-row gap-1 items-center'>
										{Math.sign(formatUnit(logRemainder.remainder)) === -1 ? (
											<ArrowUp className='w-3 h-3 text-red-600 animate-bounce' />
										) : (
											<ArrowDown className='w-3 h-3 text-green-600 animate-bounce' />
										)}
										<span>{Math.abs(formatUnit(logRemainder.remainder))}</span>
									</div>
								</div>
							</Badge>
						</PopoverTrigger>
						<PopoverContent className='text-xs text-muted-foreground flex flex-col gap-2 max-w-[95vw] w-[90vw] bg-neutral-800'>
							<ScrollArea className='w-full'>
								<div className='max-h-[65vh]'>
									<div className='flex flex-row items-center gap-2'>
										<Info className='w-4 h-4 text-foreground' />
										<span className='text-foreground text-lg'>
											Cumulative Values
										</span>
									</div>
									<div>
										The cumulative value are the calories that you left off with
										from yesterday&apos;s total calories consumed, minus your
										BMR and the calories expended that you may or may not have
										entered.
									</div>
									<div className='grid grid-cols-[75%,25%] gap-2 w-full pt-4'>
										<div>Yesterday&apos;s Calories</div>
										<div className='text-foreground'>
											{formatUnit(logRemainder.yesterdaysConsumed)}
										</div>
										<div>Yesterday&apos;s Expended</div>
										<div className='text-foreground'>
											{formatUnit(logRemainder.yesterdaysExpended)}
										</div>
										<div>Base Metabolic Rate</div>
										<div className='text-foreground'>{logMacros.bmr}</div>
										<div>Yesterday&apos;s Remainder</div>
										<div className='text-foreground'>
											{formatUnit(logRemainder.yesterdaysRemainder)}
										</div>
										<div>Today&apos; Calories</div>
										<div className='text-foreground'>
											{formatUnit(logMacros.caloriesConsumed ?? 0)}
										</div>
										<div className='col-span-2'>
											(BMR Calories + Expended Yesterday - Consumed Yesterday) +
											Expended Today - Consumed Today ={' '}
											<span className='text-foreground'>
												{formatUnit(logRemainder.remainder)}
											</span>
										</div>
									</div>

									<div className='pt-5 flex flex-col gap-2'>
										<div className='text-lg text-foreground'>
											Cumulative Loss/Gain
										</div>
										<div>
											Select a date range to calculate weight loss/gain based on
											the cumulative values you have accrued.
										</div>
										<div>
											<DateRangeChooser
												onSelect={(range) => {
													setRange(range);
												}}
											/>
										</div>
									</div>

									<div className='flex flex-col gap-0'>
										{chartData && chartData.length > 0 && (
											<>
												<div className='text-3xl text-center text-foreground'>
													{Math.abs(formatUnit(remainder / 1200))}
												</div>
												<div className='flex flex-row items-center justify-center gap-2'>
													<div className='text-center'>{remainderStr}</div>
													<div>
														{Math.sign(formatUnit((remainder / 1200) * -1)) ===
														-1 ? (
															<ArrowDown className='animate-bounce text-green-600' />
														) : (
															<ArrowUp className='animate-bounce text-red-600' />
														)}
													</div>
												</div>

												<div ref={chartRef}>
													<ChartContainer
														config={remainderConfig}
														className='min-h-[50vh] min-w-[200px] portrait:w-[75vw] mr-4'>
														<BarChart
															data={chartData}
															barSize={30}
															compact={false}
															margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
															layout='vertical'>
															<CartesianGrid vertical={false} />
															<XAxis
																angle={-90}
																className='text-xs'
																tickLine={false}
																tickMargin={10}
																offset={10}
																tickCount={120}
																height={35}
																axisLine={false}
																type='number'
															/>

															<YAxis
																width={75}
																tickCount={10}
																dataKey='createdAt'
																type='category'
																offset={0}
																tickMargin={1}
															/>

															<ChartTooltip content={<CustomTooltip />} />
															<ChartLegend
																className='mt-1'
																content={<ChartLegendContent />}
															/>

															<Bar
																dataKey='calories'
																fill='hsl(var(--chart-5))'
															/>
														</BarChart>
													</ChartContainer>
												</div>
											</>
										)}
									</div>
								</div>
							</ScrollArea>
						</PopoverContent>
					</Popover>
				)
			)}
		</>
	);
}

'use client';

import {
	deleteDishState,
	updateDishState
} from '@/lib/features/dish/preparedDishSlice';
import { logPrepDishAsync } from '@/lib/features/log/logFoodSlice';
import {
	deleteDishMutation,
	updateDishMutation
} from '@/lib/features/mutations/dishMutations';
import { useAppDispatch } from '@/lib/hooks';
import { cn, formatUnit, totalMacrosReducer } from '@/lib/utils';
import { GetFoodEntry, GetPreparedDish, GetUser } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Aperture, FilePenLine, Soup, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useTransition } from 'react';
import { BiSolidBowlHot } from 'react-icons/bi';
import { ImSpinner2 } from 'react-icons/im';
import { TbShareOff } from 'react-icons/tb';
import ShareListButton from '../grocery/share-list-button';
import SharedListAvatars from '../grocery/shared-list-avatars';
import TakePhoto from '../image/take-photo';
import NumberIncrementor from '../number-incrementor';
import TruncateSection from '../truncate-section';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardTitle
} from '../ui/card';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import DishFoodItem from './dish-food-item';
import DishImageGallery from './dish-image-gallery';

export default function DishCard({
	dish,
	readOnly = false
}: {
	dish: GetPreparedDish;
	readOnly?: boolean;
}) {
	const dispatch = useAppDispatch();
	const [prepDish, setPrepDish] = useState<GetPreparedDish>(dish);
	const [items, setItems] = useState<GetFoodEntry[]>(dish.foodItems);
	const [loggingDish, setLoggingDish] = useTransition();
	const [isEditMode, setIsEditMode] = useState(false);
	const [dishProps, setDishProps] = useState<{
		name: string;
		description: string;
	}>({ name: prepDish.name, description: prepDish.description });
	const [macros, setMacros] = useState<{
		totalCals: number;
		totalCarb: number;
		totalProtein: number;
		totalFat: number;
	}>({ totalCals: 0, totalCarb: 0, totalProtein: 0, totalFat: 0 });
	const query = useQueryClient();

	const [photoDlgOpen, setPhotoDlgOpen] = useState(false);

	useEffect(() => {
		const { calories, carbs, fat, protein } = totalMacrosReducer(items);

		setMacros({
			totalCals: formatUnit(calories),
			totalCarb: formatUnit(carbs),
			totalProtein: formatUnit(protein),
			totalFat: formatUnit(fat)
		});
	}, [items]);

	useEffect(() => {
		if (!prepDish.sharedUsers.includes(prepDish.userId)) {
			const upd = [...prepDish.sharedUsers];
			upd.push(prepDish.userId);

			const unq = Array.from(
				upd.reduce((set, e) => set.add(e), new Set())
			) as string[];

			setSharedUsers(unq);
		}
	}, [prepDish]);

	const [sharedUsers, setSharedUsers] = useState<string[]>([]);

	const { data: session } = useSession();
	const user = session?.user as GetUser;

	const [sessionUserIsDishOwner] = useState(user.id === prepDish.userId);

	const { isPending: deletePending, mutate: deleteDishItem } = useMutation(
		deleteDishMutation()
	);

	const { isPending: updatePending, mutate: updateDishItem } = useMutation(
		updateDishMutation()
	);

	const handleDelete = () => {
		// tanstack mutate
		deleteDishItem(prepDish.id, {
			onSuccess: (res) => {
				// redux
				dispatch(
					deleteDishState({
						id: res.data?.id ?? '',
						name: res.data?.name ?? '',
						description: res.data?.description ?? '',
						dishList: '[]'
					})
				);

				// tanstack
				query.invalidateQueries({ queryKey: ['dishes'] });
			}
		});
	};

	const updatePrepDish = (dish: GetPreparedDish) => {
		// tanstack mutation
		updateDishItem(dish, {
			onSuccess: (res) => {
				if (res.success) {
					const upDish = res.data as GetPreparedDish;

					setPrepDish(upDish);

					// redux
					dispatch(
						updateDishState({
							id: upDish.id,
							name: upDish.name,
							description: upDish.description,
							dishList: '[]'
						})
					);

					// tanstack - not required since list is technically the same and we have updated prepDish state above
					//query.invalidateQueries({ queryKey: ['dishes'] });
				}
			}
		});
	};

	return (
		<Card>
			<CardTitle className='p-2 font-normal flex flex-row items-center gap-2 relative'>
				{updatePending ? (
					<ImSpinner2 className='text-slate-500 w-6 h-6 animate-spin' />
				) : (
					<Soup className='w-6 h-6 text-fuchsia-500' />
				)}
				<div>
					{isEditMode ? (
						<Input
							defaultValue={prepDish.name}
							onChange={(e) => {
								const upd = { ...dishProps };
								upd.name = e.target.value;
								setDishProps(upd);
							}}
						/>
					) : (
						<div
							className={cn(
								'text-md w-32 text-fuchsia-200 !leading-5 capitalize',
								readOnly && 'text-lg w-48'
							)}>
							{prepDish.name}
						</div>
					)}
				</div>

				{!readOnly && !isEditMode && (
					<div className='absolute top-0 right-0 flex flex-row-reverse flex-wrap gap-2 items-center justify-center'>
						{sessionUserIsDishOwner && (
							<Dialog>
								<DialogTrigger asChild>
									<Button
										size={'icon'}
										variant={'secondary'}>
										<X />
									</Button>
								</DialogTrigger>
								<DialogContent className='flex flex-col gap-4 items-center'>
									<DialogTitle>Confirm Delete</DialogTitle>
									<DialogDescription>
										Are you sure you want to delete this dish? This action
										cannot be undone
									</DialogDescription>
									<Button
										disabled={deletePending}
										onClick={handleDelete}>
										{deletePending ? (
											<ImSpinner2 className='animate-spin' />
										) : (
											<X />
										)}
										Delete
									</Button>
								</DialogContent>
							</Dialog>
						)}

						<Dialog
							open={photoDlgOpen}
							onOpenChange={setPhotoDlgOpen}>
							<DialogTrigger asChild>
								<Button
									size={'icon'}
									variant={'secondary'}>
									<Aperture />
								</Button>
							</DialogTrigger>
							<DialogContent className='max-w-[100vw] max-h-[80vh] overflow-y-auto h-[80vh]'>
								<DialogTitle>
									<Aperture className='w-6 h-6 text-muted-foreground' />
								</DialogTitle>
								<TakePhoto<GetPreparedDish>
									data={prepDish}
									type='dish'
									onSuccess={() => {
										setPhotoDlgOpen(false);
									}}
								/>
							</DialogContent>
						</Dialog>

						<div className='flex flex-row gap-2 items-center justify-center'>
							<SharedListAvatars userIds={sharedUsers} />

							{sessionUserIsDishOwner && (
								<div>
									{sharedUsers.length === 1 ? (
										<ShareListButton
											iconMode={true}
											onSelect={async (userId) => {
												if (userId) {
													const update = [...sharedUsers];
													update.push(userId);

													setSharedUsers(update);

													const up = { ...prepDish };
													up.sharedUsers = update.filter(
														(usr) => usr !== prepDish.userId
													);

													setPrepDish(up);

													updatePrepDish(up);
												}
											}}
										/>
									) : (
										<Button
											onClick={async () => {
												setSharedUsers([]);

												const upd = { ...prepDish };
												upd.sharedUsers = [];

												updatePrepDish(upd);
											}}
											disabled={updatePending}
											variant={'secondary'}
											size={'icon'}>
											{updatePending ? (
												<ImSpinner2 className='animate-spin' />
											) : (
												<TbShareOff />
											)}
										</Button>
									)}
								</div>
							)}
						</div>
					</div>
				)}
			</CardTitle>
			{dish.description && (
				<CardDescription className='p-2'>
					{isEditMode ? (
						<Textarea
							className='leading-tight'
							defaultValue={prepDish.description}
							placeholder={prepDish.description}
							onChange={(e) => {
								const upd = { ...dishProps };
								upd.description = e.target.value;
								setDishProps(upd);
							}}
						/>
					) : (
						<div className={cn('leading-tight', readOnly && 'text-xs')}>
							{prepDish.description}
						</div>
					)}
				</CardDescription>
			)}
			<CardContent className='flex flex-col gap-2 w-full px-2'>
				<DishImageGallery dish={prepDish} />

				<TruncateSection
					useCardBG={true}
					label='See more'>
					<div className='w-full'>
						{items &&
							items.length > 0 &&
							items.map((item, indx) => (
								<DishFoodItem
									noDeleteButton={readOnly}
									readOnly={readOnly}
									onDelete={(item) => {
										const upd = { ...dish };

										const newList = upd.foodItems.filter(
											(dItem) =>
												dItem.id !== item.id || dItem.eatenAt !== item.eatenAt
										);

										upd.foodItems = newList;

										setPrepDish(upd);
										setItems(upd.foodItems);

										updatePrepDish(upd);
									}}
									onEdit={(item) => {
										const upd = { ...dish };

										const editItem = upd.foodItems.find(
											(dItem) =>
												dItem.id === item.id && dItem.eatenAt === item.eatenAt
										);

										if (editItem) {
											Object.assign(editItem, item);
										}

										setPrepDish(upd);
										setItems(upd.foodItems);

										updatePrepDish(upd);
									}}
									key={`${item.id}-${item.eatenAt}-${indx}`}
									indx={indx}
									item={item}
								/>
							))}
					</div>
				</TruncateSection>

				<div className='flex flex-row flex-wrap items-center justify-evenly	gap-1 pt-4 w-full'>
					<Badge
						className='font-normal text-muted-foreground flex flex-col gap-0 w-[75px]'
						variant={'outline'}>
						Calories
						<span className='text-foreground'>{macros?.totalCals}</span>
					</Badge>
					<Badge
						className='font-normal text-muted-foreground flex flex-col gap-0 w-[75px]'
						variant={'outline'}>
						<div>Carbs g</div>
						<span className='text-foreground'>{macros?.totalCarb}</span>
					</Badge>
					<Badge
						className='font-normal text-muted-foreground flex flex-col gap-0 w-[75px]'
						variant={'outline'}>
						<div>Protein g</div>
						<span className='text-foreground'>{macros?.totalProtein}</span>
					</Badge>
					<Badge
						className='font-normal text-muted-foreground flex flex-col gap-0 w-[75px]'
						variant={'outline'}>
						<div>Fat g</div>
						<span className='text-foreground'>{macros?.totalFat}</span>
					</Badge>
				</div>

				{!readOnly && (
					<div>
						<NumberIncrementor
							minValue={0.1}
							value={1}
							onChange={(val) => {
								const cloneItems = [...items];

								const updatedItems = cloneItems.map((item) => ({
									...item,
									numServings: item.numServings * val
								}));

								const dishUpd = { ...prepDish };
								dishUpd.foodItems = updatedItems;

								setPrepDish(dishUpd);

								const { calories, carbs, fat, protein } =
									totalMacrosReducer(updatedItems);

								setMacros({
									totalCals: formatUnit(calories),
									totalCarb: formatUnit(carbs),
									totalProtein: formatUnit(protein),
									totalFat: formatUnit(fat)
								});
							}}>
							<div className='text-xs text-muted-foreground'>Serving Size</div>
						</NumberIncrementor>
					</div>
				)}
			</CardContent>

			{!readOnly && (
				<CardFooter className='px-2 flex flex-row items-center justify-between'>
					<div className='flex flex-row items-center gap-2'>
						{sessionUserIsDishOwner && (
							<Button onClick={() => setIsEditMode(!isEditMode)}>
								<FilePenLine />
								{isEditMode ? 'Cancel' : 'Edit'}
							</Button>
						)}

						{isEditMode && (
							<Button
								disabled={updatePending}
								onClick={() => {
									const upd = { ...prepDish };
									upd.name = dishProps.name;
									upd.description = dishProps.description;

									updatePrepDish(upd);

									setIsEditMode(false);
								}}>
								{updatePending ? (
									<ImSpinner2 className='animate-spin' />
								) : (
									<FilePenLine />
								)}
								Update
							</Button>
						)}
					</div>

					<Button
						disabled={loggingDish}
						onClick={() => {
							setLoggingDish(async () => {
								dispatch(logPrepDishAsync(prepDish));
							});
						}}>
						{loggingDish ? (
							<ImSpinner2 className='animate-spin' />
						) : (
							<BiSolidBowlHot />
						)}
						Log Dish
					</Button>
				</CardFooter>
			)}
		</Card>
	);
}

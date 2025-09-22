import { getFoodItemById } from '@/actions/food-actions';
import { deleteFoodItemImage } from '@/actions/image-actions';
import {
	deleteImageState,
	selectImageData,
	selectImageStatus
} from '@/lib/features/image/imageSlice';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import { GetFoodItem, GetFoodItemImage, GetUser } from '@/types';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useEffect, useState, useTransition } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { MdDelete } from 'react-icons/md';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { toast } from 'sonner';
import FadeInImage from '../image/fade-in-image';
import { Button } from '../ui/button';
import {
	Carousel,
	CarouselApi,
	CarouselContent,
	CarouselItem
} from '../ui/carousel';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger
} from '../ui/dialog';

export default function FoodItemImageGallery({ item }: { item: GetFoodItem }) {
	const dispatch = useAppDispatch();
	const imageData = useAppSelector(selectImageData);
	const imageStatus = useAppSelector(selectImageStatus);

	const { data: session } = useSession();
	const user = session?.user as GetUser;
	const itemIsOwnedByUser = item.userId === user.id;

	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		api.scrollTo(current);
	}, [api]);

	const [images, setImages] = useState<GetFoodItemImage[] | undefined>(
		item.foodItemImages
	);
	const [isFetching, setIsFetching] = useTransition();

	const fetchItem = () => {
		setIsFetching(async () => {
			const res = await getFoodItemById(item.id);

			if (res.success && res.data) {
				setIsFetching(() => {
					setImages(res.data.foodItemImages as GetFoodItemImage[]);
				});
			}
		});
	};

	useEffect(() => {
		if (
			(imageStatus === 'added' && imageData.type === 'foodItem') ||
			(imageStatus === 'deleted' && imageData.type === 'foodItem')
		) {
			fetchItem();
		}
	}, [imageData, imageStatus]);

	const [isDeleting, setIsDeleting] = useTransition();

	const delImage = (img: GetFoodItemImage) => {
		setIsDeleting(async () => {
			const res = await deleteFoodItemImage(img);

			if (res.success && res.data) {
				toast.success(res.message);

				dispatch(
					deleteImageState({
						alt: res.data.alt,
						id: res.data.id,
						type: 'foodItem',
						url: res.data.url
					})
				);
			} else {
				toast.error(res.message);
			}
		});
	};

	return (
		<>
			{isFetching ? (
				<ImSpinner2 className='w-16 h-16 animate-spin opacity-10' />
			) : (
				<Carousel className='w-full'>
					<CarouselContent>
						{images &&
							images.length > 0 &&
							images.map(
								(img, indx) =>
									img &&
									img.url && (
										<CarouselItem
											onClick={() => {
												setCurrent(indx);
											}}
											key={img.id}
											className='basis-1/4'>
											<Dialog>
												<DialogTrigger>
													<FadeInImage
														src={img.url}
														alt={img.alt}
														width={50}
														height={100}
														className='aspect-auto rounded-md h-full w-full'
													/>
												</DialogTrigger>

												<DialogContent className='max-w-[100vw]'>
													<DialogTitle className='capitalize'>
														{item.name}
													</DialogTitle>
													<DialogDescription />
													<Carousel setApi={setApi}>
														<CarouselContent>
															{images.map((img2) => (
																<CarouselItem
																	key={img2.id}
																	className='flex flex-col gap-2 relative h-full'>
																	<div className='text-muted-foreground text-sm flex flex-row items-center relative'>
																		{format(img2.createdAt, 'eee PP h:mm a')}

																		{itemIsOwnedByUser && (
																			<Dialog>
																				<DialogTrigger asChild>
																					<Button
																						size={'icon'}
																						className='absolute w-fit h-fit rounded-full right-0 top-2 z-30 bg-red-600 p-2 flex flex-row items-center justify-center text-center text-foreground gap-1'>
																						<MdDelete className='!w-6 !h-6' />
																					</Button>
																				</DialogTrigger>
																				<DialogContent className='flex flex-col items-center'>
																					<DialogTitle>
																						Confirm Delete
																					</DialogTitle>

																					<div className='leading-tight'>
																						Are you sure you want to delete this
																						image? This action cannot be undone.
																					</div>

																					<Button
																						variant={'outline'}
																						onClick={() => delImage(img2)}>
																						{isDeleting ? (
																							<ImSpinner2 className='animate-spin' />
																						) : (
																							<MdDelete />
																						)}
																						Delete
																					</Button>
																				</DialogContent>
																			</Dialog>
																		)}
																	</div>
																	<TransformWrapper>
																		<TransformComponent>
																			<FadeInImage
																				src={img2.url}
																				alt={img2.alt}
																				width={500}
																				height={1000}
																				className='aspect-auto rounded-md'
																			/>
																		</TransformComponent>
																	</TransformWrapper>

																	<div className='w-full bottom-0 h-24 absolute bg-amber-400/0 z-30'></div>
																</CarouselItem>
															))}
														</CarouselContent>
													</Carousel>
												</DialogContent>
											</Dialog>
										</CarouselItem>
									)
							)}
					</CarouselContent>
				</Carousel>
			)}
		</>
	);
}

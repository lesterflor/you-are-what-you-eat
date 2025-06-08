import { getDishById } from '@/actions/prepared-dish-actions';
import { useAppSelector } from '@/lib/hooks';
import { selectImageData, selectImageStatus } from '@/lib/image/imageSlice';
import { GetPreparedDish, GetPreparedDishImage } from '@/types';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import FadeInImage from '../image/fade-in-image';
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

export default function DishImageGallery({ dish }: { dish: GetPreparedDish }) {
	const imageData = useAppSelector(selectImageData);
	const imageStatus = useAppSelector(selectImageStatus);

	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		api.scrollTo(current);
	}, [api]);

	const [images, setImages] = useState<GetPreparedDishImage[] | undefined>(
		dish.preparedDishImages
	);
	const [isFetching, setIsFetching] = useState(false);

	const fetchDish = async () => {
		setIsFetching(true);
		const res = await getDishById(dish.id);

		if (res.success && res.data) {
			setImages(res.data.preparedDishImages as GetPreparedDishImage[]);
		}

		setIsFetching(false);
	};

	useEffect(() => {
		if (imageStatus === 'added' && imageData.type === 'dish') {
			fetchDish();
		}
	}, [imageData, imageStatus]);

	return (
		<>
			{isFetching ? (
				<ImSpinner2 className='w-16 h-16 animate-spin opacity-10' />
			) : (
				<Carousel className='w-full'>
					<CarouselContent>
						{images &&
							images.length > 0 &&
							images.map((img, indx) => (
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
												{dish.name}
											</DialogTitle>
											<DialogDescription />
											<Carousel setApi={setApi}>
												<CarouselContent>
													{images
														.sort(
															(a, b) =>
																b.createdAt.getTime() - a.createdAt.getTime()
														)
														.map((img) => (
															<CarouselItem
																key={img.id}
																className='flex flex-col gap-2'>
																<div className='text-muted-foreground text-sm flex flex-row items-center relative'>
																	{format(img.createdAt, 'eee PP h:mm a')}
																</div>
																<TransformWrapper>
																	<TransformComponent>
																		<FadeInImage
																			src={img.url}
																			alt={img.alt}
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
							))}
					</CarouselContent>
				</Carousel>
			)}
		</>
	);
}

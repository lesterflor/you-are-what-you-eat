import { deleteDishImageMutation } from '@/lib/features/mutations/dishMutations';
import { useAppDispatch } from '@/lib/hooks';
import { deleteImageState } from '@/lib/image/imageSlice';
import { getDishImagesOptions } from '@/lib/queries/dishQueries';
import { GetPreparedDish, GetPreparedDishImage, GetUser } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { ImSpinner2 } from 'react-icons/im';
import { MdDelete } from 'react-icons/md';
import { useInView } from 'react-intersection-observer';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
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

export default function DishImageGallery({ dish }: { dish: GetPreparedDish }) {
	const query = useQueryClient();
	const dispatch = useAppDispatch();

	const { data: session } = useSession();
	const user = session?.user as GetUser;
	const itemIsOwnedByUser = dish.userId === user.id;
	const [fetchImages, setFetchImages] = useState(false);

	const [ref, inView] = useInView({ triggerOnce: true });

	useEffect(() => {
		if (inView) {
			setFetchImages(inView);
		}
	}, [inView]);

	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		if (!api) {
			return;
		}

		api.scrollTo(current);
	}, [api]);

	const { data: images, isFetching } = useQuery(
		getDishImagesOptions(
			dish.id,
			fetchImages && dish.preparedDishImages.length > 0
		)
	);

	const { mutate: deleteImgMutation, isPending: isDeleting } = useMutation(
		deleteDishImageMutation(dish.id)
	);

	const delImage = (img: GetPreparedDishImage) => {
		deleteImgMutation(img.id, {
			onSuccess: (res) => {
				// redux
				dispatch(
					deleteImageState({
						alt: res.data?.alt ?? '',
						id: res.data?.id ?? '',
						type: 'dish',
						url: res.data?.url ?? ''
					})
				);

				// tanstack
				query.invalidateQueries({ queryKey: ['dishImages', dish.id] });
			}
		});
	};

	return (
		<div ref={ref}>
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
													{images.map((img) => (
														<CarouselItem
															key={img.id}
															className='flex flex-col gap-2 relative h-full'>
															<div className='text-muted-foreground text-sm flex flex-row items-center relative'>
																{format(img.createdAt, 'eee PP h:mm a')}

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
																			<DialogTitle>Confirm Delete</DialogTitle>

																			<div className='leading-tight'>
																				Are you sure you want to delete this
																				image? This action cannot be undone.
																			</div>

																			<Button
																				variant={'outline'}
																				onClick={() => delImage(img)}>
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
		</div>
	);
}

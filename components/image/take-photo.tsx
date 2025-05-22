'use client';

import { Button } from '@/components/ui/button';
import { useAppDispatch } from '@/lib/hooks';
import { cn } from '@/lib/utils';

import { uploadDishImage } from '@/actions/image-actions';
import { addImageState } from '@/lib/image/imageSlice';
import { GetPreparedDish, GetPreparedDishImage } from '@/types';
import { Aperture, CameraOff, Save } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Camera, CameraType } from 'react-camera-pro';
import { ImSpinner9 } from 'react-icons/im';
import {
	MdHighlight,
	MdOutlineFlipCameraIos,
	MdOutlineHighlight
} from 'react-icons/md';
import { useAudioPlayer } from 'react-use-audio-player';
import { toast } from 'sonner';
import FullImagePreview from '../image/full-image-preview';
import PhotoImagePreview from '../image/photo-image-preview';

type SupportedImageTypes = 'dish';
interface TakePhotoProps<T> {
	data: T;
	type: SupportedImageTypes;
	onSuccess?: () => void;
}

export default function TakePhoto<T>({
	data,
	type,
	onSuccess
}: TakePhotoProps<T>) {
	const dispatch = useAppDispatch();

	const camera = useRef<CameraType>(null);
	const [file, setFile] = useState<File | null>(null);
	const [cameraActive, setCameraActive] = useState(true);

	const [numberOfCameras, setNumberOfCameras] = useState(0);
	const [image, setImage] = useState<string | null>(null);
	const [showImage, setShowImage] = useState<boolean>(false);
	const [torchToggled, setTorchToggled] = useState<boolean>(false);

	const [uploading, setUploading] = useState(false);

	const [tookShot, setTookShot] = useState(false);

	useEffect(() => {
		if (tookShot) {
			setTimeout(() => {
				setTookShot(false);
			}, 150);
		}
	}, [tookShot]);

	useEffect(() => {
		if (image) {
			const url = image;
			fetch(url)
				.then((res) => res.blob())
				.then((blob) => {
					const file = new File([blob], `${new Date().getTime()}.jpg`, {
						type: 'image/jpeg'
					});

					setFile(file);
				});
		}
	}, [image]);

	const addPhotoToSaved = async () => {
		if (file) {
			const formData = new FormData();
			formData.append('image', file, file.name);

			try {
				setUploading(true);

				if (type === 'dish') {
					const res = await uploadDishImage(formData, data as GetPreparedDish);
					if (res.success && res.data) {
						toast.success(res.message);
						setCameraActive(false);
						onSuccess?.();
						const { preparedDishId, url, alt } =
							res.data as GetPreparedDishImage;

						dispatch(
							addImageState({
								id: preparedDishId,
								url,
								alt,
								type: 'dish'
							})
						);
					} else {
						toast.error(res.message);
					}
					setShowImage(!res.success);
				}

				setUploading(false);
			} catch (error) {
				setUploading(false);
				toast.error(`Error uploading image: ${error}`);
			}

			onSuccess?.();
		}
	};

	const { togglePlayPause } = useAudioPlayer(
		'/sound/mixkit-camera-shutter-click-1133.wav',
		{
			autoplay: false
		}
	);

	return (
		<>
			<div className='absolute top-4 z-50 left-32'>
				<Button
					className={cn(
						'!bg-gray-950/15 rounded-full',
						cameraActive ? 'text-black' : 'text-muted-foreground'
					)}
					onClick={() => {
						setCameraActive(!cameraActive);
					}}
					variant={'outline'}>
					{cameraActive ? (
						<CameraOff className='!w-6 !h-6 opacity-50' />
					) : (
						<Aperture className='!w-6 !h-6 opacity-50' />
					)}
					{cameraActive ? 'Disable' : 'Enable'}
				</Button>
			</div>

			<div className='flex flex-col gap-4 relative h-full'>
				{cameraActive && (
					<div className='fixed top-0 left-0 w-full h-full'>
						{showImage ? (
							<>
								<FullImagePreview
									onClick={() => {
										setShowImage(!showImage);
									}}
									image={image}
								/>
							</>
						) : (
							<Camera
								ref={camera}
								aspectRatio='cover'
								facingMode='environment'
								numberOfCamerasCallback={(i) => setNumberOfCameras(i)}
								//videoSourceDeviceId={activeDeviceId}
								errorMessages={{
									noCameraAccessible:
										'No camera device accessible. Please connect your camera or try a different browser.',
									permissionDenied:
										'Permission denied. Please refresh and give camera permission.',
									switchCamera:
										'It is not possible to switch camera to different one because there is only one video device accessible.',
									canvas: 'Canvas is not supported.'
								}}
								videoReadyCallback={() => {
									console.log('Video feed ready.');
								}}
							/>
						)}

						<div className='fixed flex flex-row items-center justify-between gap-6 bg-black/20 w-full h-[20%] bottom-0 z-10 py-2 px-4'>
							<PhotoImagePreview
								className={cn(
									'transition-all',
									tookShot ? 'scale-125' : 'scale-100',
									!image && 'w-0'
								)}
								onClick={() => {
									setShowImage(!showImage);
								}}
								image={image}
							/>

							<Button
								onClick={() => {
									if (camera.current) {
										togglePlayPause();
										setTookShot(true);
										const photo = camera.current.takePhoto();
										setImage(photo as string);
									}
								}}
								variant={'outline'}
								size={'icon'}
								className='w-18 h-18 rounded-full absolute left-[43vw]'>
								<Aperture
									className={cn(
										'!w-12 !h-12 opacity-50 transition-all',
										tookShot
											? 'opacity-85 animate-[spin_150ms_ease-out] scale-80'
											: 'opacity-50 scale-100'
									)}
								/>
							</Button>

							<div className='flex flex-col items-center gap-2 w-auto h-28 justify-evenly'>
								<Button
									onClick={() => {
										if (camera.current) {
											setTorchToggled(camera.current.toggleTorch());
										}
									}}
									variant={'outline'}
									size={'icon'}>
									{torchToggled ? (
										<MdHighlight className='!w-8 !h-8' />
									) : (
										<MdOutlineHighlight className='!w-8 !h-8' />
									)}
								</Button>

								{numberOfCameras > 1 && (
									<Button
										onClick={() => {
											if (camera.current) {
												const result = camera.current.switchCamera();
												console.log(result);
											}
										}}
										variant={'outline'}
										size={'icon'}>
										<MdOutlineFlipCameraIos className='!w-8 !h-8' />
									</Button>
								)}
							</div>
						</div>

						<div
							className={cn(
								'absolute w-full h-full opacity-0 bg-white transition-opacity',
								tookShot ? 'opacity-40' : 'opacity-0'
							)}></div>

						{showImage && (
							<div className='z-50 absolute bottom-2 left-2'>
								<Button
									className='!bg-gray-950/25 !p-6 rounded-full'
									variant={'outline'}
									disabled={uploading}
									onClick={() => {
										addPhotoToSaved();
									}}>
									{uploading ? (
										<ImSpinner9 className='!w-6 !h-6 animate-spin' />
									) : (
										<Save className='!w-6 !h-6' />
									)}
									Save
								</Button>
							</div>
						)}
					</div>
				)}

				{!cameraActive && (
					<div className='w-full h-full flex flex-col items-center justify-center'>
						<CameraOff className='w-44 h-44 opacity-5' />
					</div>
				)}
			</div>
		</>
	);
}

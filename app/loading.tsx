import { TbFidgetSpinner } from 'react-icons/tb';

export default function Loading() {
	return (
		<div className='w-full h-[60vh] flex items-center justify-center'>
			<TbFidgetSpinner className='animate-spin w-32 h-32 opacity-20' />
		</div>
	);
}

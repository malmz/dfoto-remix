import type { MetaFunction } from '@remix-run/node';
import { Outlet, isRouteErrorResponse, useRouteError } from '@remix-run/react';
import { CameraOff } from 'lucide-react';
import { useEffect } from 'react';
import {
	type CrumbHandle,
	DynamicBreadcrum,
} from '~/components/dynamic-breadcrum';

export const meta: MetaFunction = () => [{ title: '🔒DFoto - Admin' }];

export const handle: CrumbHandle = {
	breadcrumb: (_, current) =>
		!current ? { to: '/admin', title: 'Dashboard' } : undefined,
};

export default function Layout() {
	return (
		<>
			<div className='h-14 px-4 flex items-center'>
				<DynamicBreadcrum />
			</div>
			<Outlet />
		</>
	);
}

export function ErrorBoundary() {
	const error = useRouteError();
	useEffect(() => {
		console.error(error);
	}, [error]);

	if (isRouteErrorResponse(error)) {
		return (
			<div className='grid place-content-center grow'>
				<h2 className='font-bold text-2xl'>
					{error.status} {error.statusText ?? 'Error'}
				</h2>
				<p className='text-lg'>{error.data}</p>
			</div>
		);
	}
	if (error instanceof Error) {
		return (
			<div className='grid place-content-center grow'>
				<h2 className='font-bold text-2xl'>Oof! Nån gick snätt!</h2>
				<p className='text-lg'>{error.message}</p>
			</div>
		);
	}

	return (
		<div className='grid place-content-center grow'>
			<CameraOff className='h-24 w-24' />
			<h2 className='font-bold text-2xl'>Oof! Nån gick snätt!</h2>
		</div>
	);
}

import type { MetaFunction } from 'react-router';
import { Outlet, isRouteErrorResponse, useRouteError } from 'react-router';
import { CameraOff } from 'lucide-react';
import { useEffect } from 'react';
import {
	type CrumbHandle,
	DynamicBreadcrum,
} from '~/components/dynamic-breadcrum';
import type { Route } from './+types/layout';

export const meta: Route.MetaFunction = () => [{ title: '🔒DFoto - Admin' }];

export const handle: CrumbHandle = {
	breadcrumb: (_, current) =>
		!current ? { to: '/admin', title: 'Dashboard' } : undefined,
};

export default function Layout() {
	return (
		<>
			<div className='flex h-14 items-center px-4'>
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
			<div className='grid grow place-content-center px-4'>
				<h2 className='text-2xl font-bold'>
					{error.status} {error.statusText ?? 'Error'}
				</h2>
				<p className='text-lg'>{error.data}</p>
			</div>
		);
	}
	if (error instanceof Error) {
		return (
			<div className='grid grow place-content-center px-4'>
				<h2 className='text-2xl font-bold'>Oof! Nån gick snätt!</h2>
				<p className='text-lg'>{error.message}</p>
			</div>
		);
	}

	return (
		<div className='grid grow place-content-center px-4'>
			<CameraOff className='h-24 w-24' />
			<h2 className='text-2xl font-bold'>Oof! Nån gick snätt!</h2>
		</div>
	);
}

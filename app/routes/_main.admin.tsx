import type { MetaFunction } from '@remix-run/node';
import { Outlet } from '@remix-run/react';
import {
	DynamicBreadcrum,
	type CrumbHandle,
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
				<DynamicBreadcrum></DynamicBreadcrum>
			</div>
			<Outlet></Outlet>
		</>
	);
}

import {
	useLocation,
	useMatches,
	type UIMatch_SingleFetch,
} from '@remix-run/react';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from './ui/breadcrumb';
import { Fragment } from 'react/jsx-runtime';

export type CrumbHandle<D = unknown> = {
	breadcrumb: (
		match: UIMatch_SingleFetch<D, unknown>,
		current?: boolean,
	) =>
		| {
				to: string;
				title: string;
		  }
		| undefined;
};

function Crumb({
	match,
}: {
	match: UIMatch_SingleFetch<unknown, CrumbHandle>;
}) {
	const location = useLocation();
	const pathname = location.pathname;
	const current = match.pathname === pathname;
	const crumb = match.handle.breadcrumb(match, current)!;
	if (current) {
		return <BreadcrumbPage>{crumb.title}</BreadcrumbPage>;
	} else {
		return <BreadcrumbLink to={crumb.to}>{crumb.title}</BreadcrumbLink>;
	}
}

export function DynamicBreadcrum() {
	const matches = useMatches() as UIMatch_SingleFetch<unknown, CrumbHandle>[];
	const location = useLocation();
	const pathname = location.pathname;
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{matches
					.filter(
						(match) =>
							match.handle &&
							match.handle.breadcrumb &&
							match.handle.breadcrumb(match, match.pathname === pathname),
					)
					.map((match, i) => (
						<Fragment key={match.id}>
							{i !== 0 && <BreadcrumbSeparator></BreadcrumbSeparator>}
							<BreadcrumbItem>
								<Crumb match={match}></Crumb>
							</BreadcrumbItem>
						</Fragment>
					))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

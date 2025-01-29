import { type UIMatch, useLocation, useMatches } from 'react-router';
import { Fragment } from 'react/jsx-runtime';
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from './ui/breadcrumb';

export type CrumbHandle<D = unknown> = {
	breadcrumb: (
		match: UIMatch<D, unknown>,
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
	match: UIMatch<unknown, CrumbHandle>;
}) {
	const location = useLocation();
	const pathname = location.pathname;
	const current = match.pathname === pathname;
	const crumb = match.handle.breadcrumb(match, current)!;
	if (current) {
		return <BreadcrumbPage>{crumb.title}</BreadcrumbPage>;
	}
	return <BreadcrumbLink to={crumb.to}>{crumb.title}</BreadcrumbLink>;
}

export function DynamicBreadcrum() {
	const matches = useMatches() as UIMatch<unknown, CrumbHandle>[];
	const location = useLocation();
	const pathname = location.pathname;
	return (
		<Breadcrumb>
			<BreadcrumbList>
				{matches
					.filter((match) =>
						match.handle?.breadcrumb?.(match, match.pathname === pathname),
					)
					.map((match, i) => (
						<Fragment key={match.id}>
							{i !== 0 && <BreadcrumbSeparator />}
							<BreadcrumbItem>
								<Crumb match={match} />
							</BreadcrumbItem>
						</Fragment>
					))}
			</BreadcrumbList>
		</Breadcrumb>
	);
}

import { Link, useLocation } from '@remix-run/react';
import React from 'react';

function useSignInLink() {
	const location = useLocation();
	const params = new URLSearchParams({
		return_to: location.pathname,
	});
	return `/auth/sign-in?${params}`;
}

function useSignOutLink() {
	const location = useLocation();
	const params = new URLSearchParams({
		return_to: location.pathname,
	});
	return `/auth/sign-out?${params}`;
}

type Props = Omit<React.ComponentProps<typeof Link>, 'to'>;

export const SignInLink = React.forwardRef<HTMLAnchorElement, Props>(
	(props, ref) => {
		const link = useSignInLink();
		return (
			<Link ref={ref} to={link} {...props}>
				Sign-In
			</Link>
		);
	},
);
SignInLink.displayName = 'SignInLink';

export const SignOutLink = React.forwardRef<HTMLAnchorElement, Props>(
	(props, ref) => {
		const link = useSignOutLink();
		return (
			<Link ref={ref} to={link} {...props}>
				Sign-Out
			</Link>
		);
	},
);

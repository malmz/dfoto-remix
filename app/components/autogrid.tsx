import React from 'react';
import { cn } from '~/lib/utils';

interface Props extends React.ComponentProps<'div'> {}
export const AutoGrid = React.forwardRef<HTMLDivElement, Props>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				'mx-auto grid max-w-screen-2xl grid-cols-[repeat(auto-fit,360px)] justify-center justify-items-center gap-x-4 gap-y-8',
				className,
			)}
			{...props}
		/>
	),
);
AutoGrid.displayName = 'AutoGrid';

/*  */

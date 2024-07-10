import React from 'react';
import { cn } from '~/lib/utils';

interface Props extends React.ComponentProps<'div'> {}
export const AutoGrid = React.forwardRef<HTMLDivElement, Props>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn(
				'grid grid-cols-[repeat(auto-fit,300px)] justify-center justify-items-center gap-x-2 gap-y-3',
				className,
			)}
			{...props}
		/>
	),
);
AutoGrid.displayName = 'AutoGrid';

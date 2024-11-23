import type React from 'react';
import { createContext, useContext, useId } from 'react';
import { cn } from '~/lib/utils';
import { Label } from '../ui/label';

const FieldContext = createContext<{ id?: string; errorId?: string }>({});
export const useField = () => useContext(FieldContext);

type ErrorProps = React.HTMLAttributes<HTMLDivElement>;
export function FormError({ className, ...props }: ErrorProps) {
	const { id } = useField();
	return (
		<div
			id={id}
			className={cn('text-sm font-medium text-destructive', className)}
			{...props}
		/>
	);
}

type LabelProps = React.ComponentProps<typeof Label>;
export function FormLabel({ ...props }: LabelProps) {
	const { id } = useField();
	return <Label htmlFor={id} {...props} />;
}

type DescriptionProps = React.HTMLAttributes<HTMLParagraphElement>;
export function FormDescription({ className, ...props }: DescriptionProps) {
	const { errorId } = useField();
	return (
		<p
			id={errorId}
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

export function FormField({
	className,
	...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
	const id = useId();
	const errorId = useId();
	return (
		<FieldContext.Provider value={{ id, errorId }}>
			<div className={cn('space-y-2', className)} {...props} />
		</FieldContext.Provider>
	);
}

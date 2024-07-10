import type { ComponentProps } from 'react';
import { Input } from '../ui/input';
import { useField } from './form';

interface Props extends ComponentProps<typeof Input> {}
export function FormInput({ ...props }: Props) {
	const { id, errorId } = useField();
	return <Input id={id} aria-describedby={errorId} {...props} />;
}

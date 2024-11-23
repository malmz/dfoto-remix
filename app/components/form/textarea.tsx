import type { ComponentProps } from 'react';
import { Textarea } from '~/components/ui/textarea';
import { useField } from './form';

type Props = ComponentProps<typeof Textarea>;
export function FormTextarea({ ...props }: Props) {
	const { id, errorId } = useField();
	return <Textarea id={id} aria-describedby={errorId} {...props} />;
}

import { Textarea } from '~/components/ui/textarea';
import type { ComponentProps } from 'react';
import { useField } from './form';

interface Props extends ComponentProps<typeof Textarea> {}
export function FormTextarea({ ...props }: Props) {
  const { id, errorId } = useField();
  return <Textarea id={id} aria-describedby={errorId} {...props} />;
}

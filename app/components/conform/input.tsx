import type { FieldMetadata } from '@conform-to/react';
import { getInputProps } from '@conform-to/react';
import { Input } from '../ui/input';
import type { ComponentProps } from 'react';

export const InputConform = ({
  meta,
  type,
  ...props
}: {
  meta: FieldMetadata<string>;
  type: Parameters<typeof getInputProps>[1]['type'];
} & ComponentProps<typeof Input>) => {
  return (
    <Input
      {...getInputProps(meta, { type, ariaAttributes: true })}
      {...props}
    />
  );
};

/*import { getInputProps } from '@conform-to/react';
import { Input } from '../ui/input';
import { forwardRef } from 'react';
import { useField } from './form';

 interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  type: Parameters<typeof getInputProps>[1]['type'];
}
export const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ type = 'text', ...props }, ref) => {
    const field = useField();

    return (
      <Input
        ref={ref}
        {...getInputProps(field, { type, ariaAttributes: true })}
        {...props}
      />
    );
  }
);
FormInput.displayName = 'FormInput'; */

import React from 'react';
import { cn } from '~/lib/utils';
import { getInputProps, type FieldMetadata } from '@conform-to/react';
import { Label } from '../ui/label';
import type * as LabelPrimitive from '@radix-ui/react-label';
import { Slot } from '@radix-ui/react-slot';

const FormFieldContext = React.createContext<FieldMetadata>(
  {} as FieldMetadata
);

export function useField() {
  return React.useContext(FormFieldContext);
}

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
  field: FieldMetadata;
}
export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, ...props }, ref) => {
    return (
      <FormFieldContext.Provider value={props.field}>
        <div ref={ref} className={cn('space-y-2', className)} {...props}></div>
      </FormFieldContext.Provider>
    );
  }
);
FormField.displayName = 'FormField';

export const FormError = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const field = React.useContext(FormFieldContext);
  return (
    <div
      ref={ref}
      className={cn('text-sm font-medium text-destructive', className)}
      id={field.errorId}
      {...props}
    ></div>
  );
});
FormError.displayName = 'FormError';

export const FormLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => {
  const field = React.useContext(FormFieldContext);

  return (
    <Label
      ref={ref}
      className={cn(field.errors && 'text-destructive', className)}
      htmlFor={field.id}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

export const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const field = React.useContext(FormFieldContext);

  return (
    <p
      ref={ref}
      id={field.descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

/* export const FormControl = React.forwardRef<
  React.ElementRef<typeof Slot>,
  React.ComponentPropsWithoutRef<typeof Slot>
>(({ ...props }, ref) => {
  const field = React.useContext(FormFieldContext);
  return (
    <Slot
      ref={ref}
      id={field.id}
      // @ts-ignore
      name={field.name}
      aria-describedby={
        !field.valid
          ? `${field.errorId} ${field.descriptionId}`
          : field.descriptionId
      }
      aria-invalid={!field.valid ? true : undefined}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl'; */

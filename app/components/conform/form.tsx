import React from 'react';
import { cn } from '~/lib/utils';
import { type FieldMetadata } from '@conform-to/react';
import { Label } from '../ui/label';

interface ErrorConformProps extends React.HTMLAttributes<HTMLDivElement> {
  meta: FieldMetadata<any>;
}
export function ErrorConform({ meta, className, ...props }: ErrorConformProps) {
  return (
    <div
      id={meta.errorId}
      className={cn('text-sm font-medium text-destructive', className)}
      {...props}
    >
      {meta.errors}
    </div>
  );
}

interface LabelConformProps extends React.ComponentProps<typeof Label> {
  meta: FieldMetadata<any>;
}
export function LabelConform({ meta, className, ...props }: LabelConformProps) {
  return (
    <Label
      htmlFor={meta.id}
      className={cn(meta.errors && 'text-destructive', className)}
      {...props}
    ></Label>
  );
}

interface DescriptionConformProps
  extends React.HTMLAttributes<HTMLParagraphElement> {
  meta: FieldMetadata<any>;
}
export function DescriptionConform({
  meta,
  className,
  ...props
}: DescriptionConformProps) {
  return (
    <p
      id={meta.descriptionId}
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export function FormField({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <div className={cn('space-y-2', className)} {...props}></div>;
}

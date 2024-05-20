import React, { useRef, useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { cn } from '~/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format, parse } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { sv } from 'date-fns/locale';
import { useField } from './form';

interface Props
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'> {
  defaultValue?: Date;
}
export function FormDatePicker({ name, defaultValue, ...props }: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { id, errorId } = useField();
  const [value, setValue] = useState(defaultValue);

  return (
    <div>
      <input
        id={id}
        className='sr-only'
        aria-hidden
        aria-describedby={errorId}
        tabIndex={-1}
        name={name}
        value={value ? format(value, 'yyyy-MM-dd') : ''}
        onChange={(e) =>
          setValue(parse(e.target.value, 'yyyy-MM-dd', new Date()))
        }
        onFocus={() => {
          triggerRef.current?.focus();
        }}
      />
      <Popover>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant={'outline'}
            className={cn(
              'flex w-full justify-start text-left font-normal focus:ring-2 focus:ring-stone-950 focus:ring-offset-2',
              !value && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {value ? (
              format(value, 'PPP', { locale: sv })
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            selected={value}
            onSelect={setValue}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

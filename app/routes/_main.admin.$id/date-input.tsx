import { cn } from '~/lib/utils';
import { CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '~/components/ui/popover';
import { Calendar } from '~/components/ui/calendar';
import { Button } from '~/components/ui/button';
import { useState } from 'react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';

type Props = {
  name?: string;
  id?: string;
  defaultValue?: Date;
};
export function DateInput({ name, id, defaultValue }: Props) {
  const [date, setDate] = useState<Date | undefined>(defaultValue);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant={'outline'}
            className={cn(
              'flex w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground'
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {date ? (
              format(date, 'PPP', { locale: sv })
            ) : (
              <span>Välj ett datum</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0'>
          <Calendar
            mode='single'
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <input
        type='date'
        name={name}
        value={date && format(date, 'yyyy-MM-dd')}
        readOnly
        hidden
      ></input>
    </>
  );
}

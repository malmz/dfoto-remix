import { useIsSubmitting } from '~/lib/utils';
import { Button } from '../ui/button';
import { Loader2 } from 'lucide-react';
import { useDebounce } from '@uidotdev/usehooks';

interface Props extends React.ComponentPropsWithoutRef<typeof Button> {}
export function StatusButton({ children, ...props }: Props) {
  const status = useIsSubmitting();
  const debounced = useDebounce(status, 50);
  return (
    <Button {...props}>
      {debounced ? (
        <Loader2 className='mr-2 h-4 w-4 animate-spin'></Loader2>
      ) : null}
      {children}
    </Button>
  );
}

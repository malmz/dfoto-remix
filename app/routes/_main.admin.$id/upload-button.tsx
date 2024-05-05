import { Button, ButtonProps } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { toast } from 'sonner';

// Alright, this component is a bit cursed but im tired and it works

interface Props extends ButtonProps {
  albumId: number;
}
export function UploadButton({ children, albumId, ...props }: Props) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef}>
      <Button asChild {...props}>
        <label htmlFor={id}>
          <Loader2 className='mr-2 h-4 w-4 animate-spin'></Loader2>

          {children}
        </label>
      </Button>
      <input
        onChange={(event) => {
          const files = event.target.files;
          if (!files) {
            return;
          }
          event.target.form?.requestSubmit();
        }}
        id={id}
        type='file'
        name='file'
        multiple
        accept='image/jpeg,image/png'
        hidden
      />
      <input type='text' name='album' defaultValue={albumId} hidden />
    </form>
  );
}

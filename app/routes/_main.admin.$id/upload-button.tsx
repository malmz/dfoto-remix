import { Button, ButtonProps } from '~/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useId, useRef } from 'react';
import { toast } from 'sonner';
import { getFormProps, useForm } from '@conform-to/react';
import { useFetcher } from '@remix-run/react';
import type { action } from '../api.upload';

interface Props extends ButtonProps {
  albumId: number;
}
export function UploadButton({ children, albumId, ...props }: Props) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher();

  return (
    <fetcher.Form
      action='/api/upload'
      method='post'
      encType='multipart/form-data'
    >
      <Button asChild {...props}>
        <label htmlFor={id}>
          {fetcher.state === 'submitting' ? (
            <Loader2 className='mr-2 h-4 w-4 animate-spin'></Loader2>
          ) : null}
          {children}
        </label>
      </Button>
      <input
        onChange={(event) => {
          const files = event.target.files;
          if (!files) {
            return;
          }
          fetcher.submit(event.currentTarget.form);
        }}
        id={id}
        type='file'
        name='files'
        multiple
        accept='image/jpeg,image/png'
        hidden
      />
      <input type='text' name='id' defaultValue={albumId} hidden />
    </fetcher.Form>
  );
}

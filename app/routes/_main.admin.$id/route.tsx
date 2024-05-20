import { PublishButton } from './publish-button';
import { Separator } from '~/components/ui/separator';
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from '@remix-run/node';
import { getAlbum } from '~/lib/data.server';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import {
  deleteImage,
  setPubishedStatus,
  setThumbnail,
  updateAlbum,
} from '~/lib/actions.server';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { ensureRole } from '~/lib/auth.server';
import type { CrumbHandle } from '~/components/dynamic-breadcrum';
import { getParams } from 'remix-params-helper';
import { FormError, FormField, FormLabel } from '~/components/form/form';
import { FormInput } from '~/components/form/input';
import { FormTextarea } from '~/components/form/textarea';
import { Loader2 } from 'lucide-react';
import { Button } from '~/components/ui/button';
import { FormDatePicker } from '~/components/form/date-picker';
import { ImageTable } from './table';

const updateSchema = z.object({
  id: z.number(),
  published: z.boolean(),
  name: z.string().min(1, {
    message: 'Titel kan inte vara tom',
  }),
  description: z.string(),
  start_at: z.date(),
});

export const meta: MetaFunction<typeof loader> = ({ data }) => [
  { title: data ? `🔒DFoto - ${data.album.name}` : undefined },
];

export const handle: CrumbHandle<typeof loader> = {
  breadcrumb: (match) => ({
    to: `/admin/${match.data.album.id}`,
    title: match.data.album.name,
  }),
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await ensureRole(['read:album'])(request);
  const album = await getAlbum(Number(params.id), true);
  if (!album) {
    throw new Response('Not found', { status: 404 });
  }
  return { album };
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  switch (formData.get('intent')) {
    case 'publish': {
      await ensureRole(['publish:album'])(request);
      const result = getParams(
        formData,
        z.object({
          id: z.number(),
          published: z.boolean(),
        })
      );
      if (!result.success) {
        return result;
      }

      await setPubishedStatus(result.data.id, !result.data.published);
      return { success: true } as const;
    }

    case 'save': {
      await ensureRole(['write:album'])(request);
      const result = getParams(formData, updateSchema);
      if (!result.success) {
        return result;
      }

      const { id, ...data } = result.data;
      await updateAlbum(id, data);
      return { success: true } as const;
    }

    case 'thumbnail': {
      await ensureRole(['write:album'])(request);
      const result = getParams(
        formData,
        z.object({ id: z.number(), album_id: z.number() })
      );
      if (!result.success) {
        return result;
      }

      await setThumbnail(result.data.album_id, result.data.id);
      return { success: true } as const;
    }

    case 'delete': {
      await ensureRole(['delete:image'])(request);
      const result = getParams(formData, z.object({ id: z.number() }));
      if (!result.success) {
        return result;
      }
      await deleteImage(result.data.id);
      return { success: true } as const;
    }

    default:
      throw new Error(`Invalid intent: ${formData.get('intent')}`);
  }
}

export default function Page() {
  const { album } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const error = fetcher.data?.success ? undefined : fetcher.data?.errors;

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success('Sparat');
    }
  }, [fetcher.data?.success]);

  return (
    <>
      <div className='container mt-8 flex max-w-prose flex-col gap-4'>
        <h1 className='text-3xl font-extrabold tracking-tight'>{album.name}</h1>
        <fetcher.Form
          id='album-form'
          method='post'
          className='flex flex-col gap-4'
        >
          <input name='id' type='hidden' defaultValue={album.id} />
          <input
            name='published'
            type='hidden'
            defaultValue={String(album.published)}
          />
          <FormField>
            <FormLabel>Titel</FormLabel>
            <FormInput type='text' name='name' defaultValue={album.name} />
            {error && <FormError>{error.name}</FormError>}
          </FormField>

          <FormField>
            <FormLabel>Beskrivning</FormLabel>
            <FormTextarea
              name='description'
              defaultValue={album.description ?? ''}
            />
            {error && <FormError>{error.description}</FormError>}
          </FormField>

          <FormField>
            <FormLabel>Datum</FormLabel>
            <FormDatePicker name='start_at' defaultValue={album.start_at} />
            {error && <FormError>{error.start_at}</FormError>}
          </FormField>

          <div className='flex justify-between items-center'>
            <Button type='submit' name='intent' value='save'>
              {fetcher.state !== 'idle' && (
                <Loader2 className='mr-2 h-4 w-4 animate-spin'></Loader2>
              )}
              Spara
            </Button>
            <PublishButton form='album-form' album={album}></PublishButton>
          </div>
        </fetcher.Form>
      </div>
      <Separator className='mx-auto mt-12 max-w-prose'></Separator>
      <div className='container mt-8 flex flex-col gap-4'>
        <h2 className='text-3xl font-extrabold tracking-tight'>Bilder</h2>

        <ImageTable
          albumId={album.id}
          thumbnailId={album.thumbnail_id}
          data={album.images}
        ></ImageTable>
      </div>
    </>
  );
}

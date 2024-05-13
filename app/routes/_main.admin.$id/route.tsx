import { PublishButton } from './publish-button';
import { Separator } from '~/components/ui/separator';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { getAlbum } from '~/lib/data.server';
import { json, useFetcher, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod';
import { setPubishedStatus, updateAlbum } from '~/lib/actions.server';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import {
  ErrorConform,
  FormField,
  LabelConform,
} from '~/components/conform/form';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { InputConform } from '~/components/conform/input';
import { TextareaConform } from '~/components/conform/textarea';
import { DatePickerConform } from '~/components/conform/date-picker';
import { StatusButton } from '~/components/conform/status-button';
import { ensureRole } from '~/lib/auth.server';
import { DataTable } from '~/components/data-table';
import { Input } from '~/components/ui/input';
import { createColumns } from './columns';
import type { Image } from '~/lib/schema.server';
import { UploadButton } from './upload-button';
import type { CrumbHandle } from '~/components/dynamic-breadcrum';

const schema = z.object({
  id: z.number(),
  published: z.boolean(),
  name: z.string().min(1, {
    message: 'Titel kan inte vara tom',
  }),
  description: z.string(),
  start_at: z.date(),
});

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
      const submission = parseWithZod(formData, { schema });
      if (submission.status !== 'success') {
        return json(submission.reply());
      }
      await setPubishedStatus(submission.value.id, !submission.value.published);
      return json(submission.reply());
    }

    case 'save': {
      await ensureRole(['write:album'])(request);
      const submission = parseWithZod(formData, { schema });
      if (submission.status !== 'success') {
        return json(submission.reply());
      }
      const { id, ...data } = submission.value;
      await updateAlbum(id, data);
      return json(submission.reply());
    }

    default:
      throw new Error('Invalid intent');
  }
}

export default function Page() {
  const { album } = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof action>();
  const [form, fields] = useForm({
    id: 'album-form',
    lastResult: fetcher.data,
    defaultValue: {
      id: album.id,
      published: album.published,
      name: album.name,
      description: album.description,
      start_at: album.start_at,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldDirtyConsider: () => true,
    shouldValidate: 'onBlur',
  });

  useEffect(() => {
    if (form.status === 'success') {
      toast.success('Sparat');
    }
  }, [form.status]);

  return (
    <>
      <div className='container mt-8 flex max-w-prose flex-col gap-4'>
        <h1 className='text-3xl font-extrabold tracking-tight'>{album.name}</h1>
        <fetcher.Form
          method='post'
          className='flex flex-col gap-4'
          {...getFormProps(form)}
        >
          <input {...getInputProps(fields.id, { type: 'hidden' })} />
          <input {...getInputProps(fields.published, { type: 'hidden' })} />
          <FormField>
            <LabelConform meta={fields.name}>Titel</LabelConform>
            <InputConform meta={fields.name} type='text' />
            <ErrorConform meta={fields.name} />
          </FormField>

          <FormField>
            <LabelConform meta={fields.description}>Beskrivning</LabelConform>
            <TextareaConform meta={fields.description} />
            <ErrorConform meta={fields.description} />
          </FormField>

          <FormField>
            <LabelConform meta={fields.start_at}>Datum</LabelConform>
            <DatePickerConform meta={fields.start_at} />
            <ErrorConform meta={fields.start_at} />
          </FormField>

          <div className='flex justify-between items-center'>
            <StatusButton
              type='submit'
              name='intent'
              value='save'
              disabled={!form.dirty}
            >
              Spara
            </StatusButton>
            <PublishButton
              formId={form.id}
              album={album}
              dirty={form.dirty}
            ></PublishButton>
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

type Props = {
  albumId: number;
  thumbnailId: number | null;
  data: Image[];
};
export function ImageTable({ albumId, thumbnailId, data }: Props) {
  const [filter, setFilter] = useState('');
  const mappedData = data.map((image) => ({
    ...image,
    thumbnail: image.id === thumbnailId,
  }));

  return (
    <div>
      <div className='flex items-center justify-between gap-4 py-4'>
        <Input
          type='search'
          placeholder='Sök'
          value={filter ?? ''}
          onChange={(event) => setFilter(event.target.value)}
          className='max-w-sm'
        ></Input>
        <UploadButton variant='outline' size='sm' albumId={albumId}>
          Ladda upp bilder
        </UploadButton>
      </div>
      <DataTable
        filter={filter}
        onFilterChange={setFilter}
        columns={createColumns()}
        data={mappedData}
        sortDesc={true}
      ></DataTable>
    </div>
  );
}

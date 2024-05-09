import { Button } from '~/components/ui/button';
import { PublishButton } from './publish-button';
import { Separator } from '~/components/ui/separator';
import { ImageTable } from './image-table';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { getAlbum } from '~/lib/data.server';
import { Form, json, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod';
import { updateAlbum } from '~/lib/actions.server';
import { getFormProps, getInputProps, useForm } from '@conform-to/react';
import {
  ErrorConform,
  FormField,
  LabelConform,
} from '~/components/conform/form';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { InputConform } from '~/components/conform/input';
import { TextareaConform } from '~/components/conform/textarea';
import { DatePickerConform } from '~/components/conform/date-picker';
import { getSession } from '~/lib/session.server';
import { useIsSubmitting } from '~/lib/utils';
import { StatusButton } from '~/components/conform/status-button';
import { authenticator } from '~/lib/auth.server';

const schema = z.object({
  id: z.number(),
  name: z.string().min(1, {
    message: 'Titel kan inte vara tom',
  }),
  description: z.string(),
  start_at: z.date(),
});

export async function loader({ params }: LoaderFunctionArgs) {
  const album = await getAlbum(Number(params.id), true);
  if (!album) {
    throw new Response('Not found', { status: 404 });
  }
  return { album };
}

export async function action({ request }: ActionFunctionArgs) {
  const session = await authenticator.isAuthenticated(request)
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return json(submission.reply());
  }

  const { id, ...data } = submission.value;

  await updateAlbum(id, data);
  return json(submission.reply());
}

export default function Page() {
  const { album } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: 'album-form',
    lastResult,
    defaultValue: {
      id: album.id,
      name: album.name,
      description: album.description,
      start_at: album.start_at,
    },
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: 'onBlur',
  });

  return (
    <>
      <div className='container mt-8 flex max-w-prose flex-col gap-4'>
        <h1 className='text-3xl font-extrabold tracking-tight'>{album.name}</h1>
        <Form
          method='post'
          className='flex flex-col gap-4'
          {...getFormProps(form)}
        >
          <input {...getInputProps(fields.id, { type: 'hidden' })} />
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
            <StatusButton type='submit'>Spara</StatusButton>
            <PublishButton formId={form.id} album={album}></PublishButton>
          </div>
        </Form>
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

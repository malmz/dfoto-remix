import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import { PublishButton } from './publish-button';
import { Textarea } from '~/components/ui/textarea';
import { DateInput } from './date-input';
import { Separator } from '~/components/ui/separator';
import { ImageTable } from './image-table';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { getAlbum } from '~/lib/data.server';
import { Form, redirect, useActionData, useLoaderData } from '@remix-run/react';
import { z } from 'zod';
import { parseWithZod } from '@conform-to/zod';
import { createAlbum, updateAlbum } from '~/lib/actions.server';
import { useForm } from '@conform-to/react';
import { FormError, FormField, FormLabel } from '~/components/conform/form';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { FormInput } from '~/components/conform/input';

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
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const { id, ...data } = submission.value;

  await updateAlbum(id, data);
}

export default function Page({ params }: { params: { id: string } }) {
  const { album } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    defaultValue: album,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: 'onBlur',
  });

  useEffect(() => {
    if (form.status === 'success') {
      toast('Sparat');
    }
  });

  return (
    <>
      <div className='container mt-8 flex max-w-prose flex-col gap-4'>
        <h1 className='text-3xl font-extrabold tracking-tight'>{album.name}</h1>
        <Form method='post' id={form.id} onSubmit={form.onSubmit}>
          <input type='hidden' name='id' defaultValue={album.id} />

          <FormField field={fields.name}>
            <FormLabel>Namn</FormLabel>
            <FormInput type='text'></FormInput>
            <FormError></FormError>
          </FormField>

          <FormField field={fields.description}>
            <FormLabel>Beskrivning</FormLabel>

            <Textarea></Textarea>
            <FormError></FormError>
          </FormField>

          <FormField field={fields.start_at}>
            <FormLabel>Namn</FormLabel>
            <DateInput
              name='date'
              id='date'
              defaultValue={album.start_at}
            ></DateInput>
            <FormError></FormError>
          </FormField>

          <div className='flex justify-between items-center'>
            <Button type='submit'>Spara</Button>
            <PublishButton album={album}></PublishButton>
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

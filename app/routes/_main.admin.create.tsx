'use client';

import { Input } from '~/components/ui/input';
import { z } from 'zod';
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { redirect, type ActionFunctionArgs } from '@remix-run/node';
import { createAlbum } from '~/lib/actions.server';
import { Form, Link, useActionData } from '@remix-run/react';
import { FormError, FormField, FormLabel } from '~/components/conform/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { FormInput } from '~/components/conform/input';

const schema = z.object({
  name: z.string().min(1, {
    message: 'Titel kan inte vara tom',
  }),
  description: z.string(),
  start_at: z.date(),
});

export async function action({ request }: ActionFunctionArgs) {
  console.log('action');

  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  await createAlbum(submission.value);
  return redirect('/admin');
}

export default function Page() {
  const lastResult = useActionData<typeof action>();
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    onSubmit(event, context) {
      console.log({ event, context });
    },
    shouldValidate: 'onBlur',
  });
  return (
    <div className='container mt-8 flex flex-col gap-4'>
      <Form method='post' id={form.id} onSubmit={form.onSubmit}>
        <Card className='max-w-screen-md mx-auto'>
          <CardHeader>
            <CardTitle>Skapa nytt album</CardTitle>
            <CardDescription>
              Fyll i namn och datum för arrangemanget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField field={fields.name}>
              <FormLabel>Titel</FormLabel>
              <FormInput type='text' />
              <FormError />
            </FormField>

            <FormField field={fields.description}>
              <FormLabel>Beskrivning</FormLabel>
              <FormInput type='text' />
              <FormError />
            </FormField>

            <FormField field={fields.start_at}>
              <FormLabel>Datum</FormLabel>
              <FormInput type='date' />
              <FormError />
            </FormField>
          </CardContent>
          <CardFooter className='gap-4 justify-between'>
            <Button asChild variant='secondary'>
              <Link to='/admin'>Tillbaka</Link>
            </Button>
            <Button type='submit'>Skapa</Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}

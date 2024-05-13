import { z } from 'zod';
import { getFormProps, useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { json, redirect, type ActionFunctionArgs } from '@remix-run/node';
import { createAlbum } from '~/lib/actions.server';
import { Form, Link, useActionData } from '@remix-run/react';
import {
  ErrorConform,
  FormField,
  LabelConform,
} from '~/components/conform/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { InputConform } from '~/components/conform/input';
import { DatePickerConform } from '~/components/conform/date-picker';
import { TextareaConform } from '~/components/conform/textarea';
import { ensureRole } from '~/lib/auth.server';
import { BreadcrumbLink } from '~/components/ui/breadcrumb';

export const handle = {
  breadcrumb: () => ({ to: '/admin/create', title: 'Create' }),
};

const schema = z.object({
  name: z.string().min(1, {
    message: 'Titel kan inte vara tom',
  }),
  description: z.string(),
  start_at: z.date(),
});

export async function action({ request }: ActionFunctionArgs) {
  await ensureRole(['write:album'])(request);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  const [{ id }] = await createAlbum(submission.value);
  return redirect(`/admin/${id}`);
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
      <Form method='post' {...getFormProps(form)}>
        <Card className='max-w-screen-md mx-auto'>
          <CardHeader>
            <CardTitle>Skapa nytt album</CardTitle>
            <CardDescription>
              Fyll i namn och datum för arrangemanget
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <FormField>
              <LabelConform meta={fields.name}>Titel</LabelConform>
              <InputConform type='text' meta={fields.name} />
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
          </CardContent>
          <CardFooter className='gap-4 justify-between'>
            <Button type='submit'>Skapa</Button>
            <Button asChild variant='secondary'>
              <Link to='/admin'>Tillbaka</Link>
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}

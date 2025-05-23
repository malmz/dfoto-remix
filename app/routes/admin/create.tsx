import {
	type ActionFunctionArgs,
	type MetaFunction,
	redirect,
} from 'react-router';
import { Form, Link, useActionData } from 'react-router';
import { getFormData } from 'remix-params-helper';
import { z } from 'zod';
import { FormDatePicker } from '~/components/form/date-picker';
import { FormError, FormField, FormLabel } from '~/components/form/form';
import { FormInput } from '~/components/form/input';
import { FormTextarea } from '~/components/form/textarea';
import { Button } from '~/components/ui/button';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '~/components/ui/card';
import { createAlbum } from '~/lib/.server/actions';
import { ensureRole } from '~/lib/.server/auth';
import type { Route } from './+types/create';

export const meta: Route.MetaFunction = () => [
	{ title: '🔒DFoto - Skapa nytt' },
];

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

export async function action({ request, context }: Route.ActionArgs) {
	ensureRole(['write:album'], context);
	const result = await getFormData(request, schema);
	if (!result.success) {
		return result;
	}

	const [{ id }] = await createAlbum(result.data);
	throw redirect(`/admin/${id}`);
}

export default function Page() {
	const lastResult = useActionData<typeof action>();
	const errors = lastResult?.errors;
	return (
		<div className='container flex flex-col gap-4'>
			<Form method='post'>
				<Card className='mx-auto max-w-screen-md'>
					<CardHeader>
						<CardTitle>Skapa nytt album</CardTitle>
						<CardDescription>
							Fyll i namn och datum för arrangemanget
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						<FormField>
							<FormLabel>Titel</FormLabel>
							<FormInput type='text' name='name' required />
							{errors && <FormError>{errors.name}</FormError>}
						</FormField>

						<FormField>
							<FormLabel>Beskrivning</FormLabel>
							<FormTextarea name='description' />
							{errors && <FormError>{errors.description}</FormError>}
						</FormField>

						<FormField>
							<FormLabel>Datum</FormLabel>
							<FormDatePicker name='start_at' />
							{errors && <FormError>{errors.start_at}</FormError>}
						</FormField>
					</CardContent>
					<CardFooter className='justify-between gap-4'>
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

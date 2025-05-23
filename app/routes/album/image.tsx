import { Link, useFetcher, useLoaderData, useParams } from 'react-router';
import { type ReactNode, useMemo, useState } from 'react';
import 'yet-another-react-lightbox/styles.css';
import { DialogClose } from '@radix-ui/react-dialog';
import {
	ChevronLeft,
	ChevronRight,
	Fullscreen,
	Info,
	Tags,
} from 'lucide-react';
import { getParams } from 'remix-params-helper';
import { z } from 'zod';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '~/components/ui/dialog';
import { Input } from '~/components/ui/input';
import { getImage, getTags } from '~/lib/.server/data';
import { useAlbum } from '~/lib/context';
import { addTag } from '~/lib/.server/actions';
import { ensureRole } from '~/lib/.server/auth';
import type { Route } from './+types/image';

export async function loader({ params }: Route.LoaderArgs) {
	const imageId = Number(params.imageId);
	const image = getImage(imageId);
	const tags = await getTags(imageId);

	return {
		image,
		tags,
	};
}

export async function action({ request, context }: Route.ActionArgs) {
	const user = ensureRole([], context);
	const formData = await request.formData();
	const result = getParams(
		formData,
		z.object({
			imageId: z.number(),
			tag: z.string(),
		}),
	);
	if (!result.success) {
		return result;
	}

	await addTag(result.data.imageId, result.data.tag, user.claims.sub);

	return { success: true } as const;
}

function LinkButton({ to, children }: { to?: string; children?: ReactNode }) {
	return (
		<Button variant='secondary' size='icon' asChild={!!to} disabled={!to}>
			{to ? <Link to={to}>{children}</Link> : children}
		</Button>
	);
}

export default function Page() {
	const { image, tags } = useLoaderData<typeof loader>();
	const fetcher = useFetcher();

	const album = useAlbum()!;
	const imageMap = useMemo(
		() =>
			new Map(
				album.images.map((image, i) => [
					image.id,
					{
						next: album.images[i + 1]?.id as number | undefined,
						prev: album.images[i - 1]?.id as number | undefined,
					},
				]),
			),
		[album],
	);
	const params = useParams();
	const imageId = Number(params.imageId);
	const albumId = Number(params.id);

	const { next, prev } = imageMap.get(imageId)!;

	return (
		<>
			<div className='-mt-4 flex h-[calc(100vh-4rem)] flex-col gap-2 px-2 py-4'>
				<img
					src={`/api/image/${imageId}?preview`}
					alt='photograph'
					className='min-h-0 w-full min-w-0 shrink grow object-contain'
				/>
				<div className='mx-auto flex gap-2'>
					<LinkButton
						to={prev != null ? `/album/${albumId}/${prev}` : undefined}
					>
						<ChevronLeft className='h-4 w-4' />
					</LinkButton>

					<Dialog>
						<DialogTrigger asChild>
							<Button variant='secondary' size='icon'>
								<Tags className='h-4 w-4' />
							</Button>
						</DialogTrigger>
						<DialogContent className='sm:max-w-[425px]'>
							<DialogHeader>
								<DialogTitle>Lägg till taggar</DialogTitle>
							</DialogHeader>
							<fetcher.Form method='post'>
								<input type='hidden' name='imageId' defaultValue={imageId} />
								<Input name='tag' />
								{tags.map((tag) => (
									<span key={tag.id}>{tag.text}</span>
								))}
							</fetcher.Form>
							<DialogFooter>
								<DialogClose asChild>
									<Button type='button' variant='secondary'>
										Färdig
									</Button>
								</DialogClose>
							</DialogFooter>
						</DialogContent>
					</Dialog>

					<Button variant='secondary' size='icon' asChild>
						<a href={`/api/image/${imageId}`}>
							<Fullscreen className='h-4 w-4' />
						</a>
					</Button>

					<Button variant='secondary' size='icon' asChild>
						<Link to='#info-header'>
							<Info className='h-4 w-4' />
						</Link>
					</Button>

					<LinkButton
						to={next != null ? `/album/${albumId}/${next}` : undefined}
					>
						<ChevronRight className='h-4 w-4' />
					</LinkButton>
				</div>
			</div>
			<div className='px-2'>
				<div>
					{tags.map((tag) => (
						<span key={tag.id}>{tag.text}</span>
					))}
				</div>
				<Card className='mx-auto w-full max-w-prose'>
					<CardHeader>
						<CardTitle id='info-header'>Bild info</CardTitle>
					</CardHeader>
					<CardContent className='prose'>
						<h1>Här vart de lite info</h1>
					</CardContent>
				</Card>
			</div>
		</>
	);
}

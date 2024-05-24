import { useLoaderData } from '@remix-run/react';
import { getAllAlbums } from '~/lib/data.server';
import { ensureRole } from '~/lib/auth.server';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { useState } from 'react';
import { deleteAlbum, setPubishedStatus } from '~/lib/actions.server';
import { getParams } from 'remix-params-helper';
import { z } from 'zod';
import { AlbumTable } from './table';

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
    case 'delete': {
      await ensureRole(['delete:album'])(request);
      const result = getParams(
        formData,
        z.object({
          id: z.number(),
        })
      );
      if (!result.success) {
        return result;
      }

      await deleteAlbum(result.data.id);
      return { success: true } as const;
    }
    default:
      throw new Error(`Invalid intent: ${formData.get('intent')}`);
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  await ensureRole(['read:album'])(request);
  const albums = await getAllAlbums();
  return { albums };
}

export default function Admin() {
  const { albums } = useLoaderData<typeof loader>();
  return (
    <div className='container mt-4 flex flex-col gap-4'>
      <h1 className='text-3xl font-extrabold tracking-tight'>Album</h1>
      <AlbumTable data={albums} />
    </div>
  );
}

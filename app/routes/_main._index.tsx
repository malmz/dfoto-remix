import { Await, json, useLoaderData } from "@remix-run/react";
import { Suspense, useEffect } from "react";
import { typeddefer, typedjson, useTypedLoaderData } from "remix-typedjson";
import { Album } from "~/components/album";
import { AutoGrid } from "~/components/autogrid";
import { Paginator } from "~/components/paginator";
import { getAlbums, getPagesCount } from "~/lib/data";

export const loader = async () => {
  const albums = getAlbums(0, 28);
  const totalPages = await getPagesCount(28);
  return typeddefer({
    totalPages,
    albums,
  });
};

export default function Page() {
  const { totalPages, albums } = useTypedLoaderData<typeof loader>();

  useEffect(() => {
    console.log(albums);
  }, [albums]);

  return (
    <>
      <div className="mt-4 grow px-2">
        <Suspense fallback={<div>Loading...</div>}>
          <AutoGrid>
            <Await resolve={albums}>
              {(albums) =>
                albums.map((album) => (
                  <Album key={album.id} album={album}></Album>
                ))
              }
            </Await>
          </AutoGrid>
        </Suspense>
      </div>
      <Paginator page={1} totalPages={totalPages} className="mt-3" />
    </>
  );
}

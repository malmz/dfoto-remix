import type { LoaderFunctionArgs } from '@remix-run/node';
import {
  Await,
  Link,
  useLoaderData,
  useRouteLoaderData,
} from '@remix-run/react';
import { format } from 'date-fns';
import { sv } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Suspense } from 'react';
import { Button } from '~/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '~/components/ui/carousel';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '~/components/ui/drawer';
import { getImage } from '~/lib/data.server';
import type { AlbumLoader } from './_main.album.$id';

export async function loader({ params }: LoaderFunctionArgs) {
  const albumId = Number(params.id);
  const imageId = Number(params.imageId);
  //const album = getAlbum(albumId);
  const image = await getImage(imageId);
  if (!image) throw new Response('Not found', { status: 404 });
  return {
    image: image.image,
    albumName: image.albumName,
    imageId,
    albumId,
  };
}

function InfoDrawer({
  image,
}: {
  image: {
    taken_by_name: string | null;
    taken_at: Date;
    mimetype: string | null;
    exif_data: any | null;
  };
}) {
  return (
    <>
      <Drawer>
        <DrawerTrigger asChild>
          <Button variant='outline' size='sm' className='sm:hidden'>
            Image info
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Info</DrawerTitle>
          </DrawerHeader>
          <div className='mx-auto grid max-w-md grid-cols-2 gap-2 p-4 py-8 text-sm'>
            <span>Fotograf</span>
            <span>{image.taken_by_name}</span>
            <span>Tagen vid</span>
            <span>{format(image.taken_at, 'PPP, pp', { locale: sv })}</span>
            <span>Format</span>
            <span>{image.mimetype}</span>
            <span>Märke</span>
            <span>{image.exif_data?.Image?.Make}</span>
            <span>Model</span>
            <span>{image.exif_data?.Image?.Model}</span>
            <span>Lins</span>
            <span>{image.exif_data?.Photo?.LensModel}</span>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function ImageCarousel({
  albumId,
  imageId,
}: {
  albumId: number;
  imageId: number;
}) {
  const { album } = useRouteLoaderData<AlbumLoader>('routes/_main.album.$id');

  return (
    <Suspense>
      <Await resolve={album}>
        {(album) => {
          const currentIndex =
            album?.images.findIndex((img) => img.id === imageId) ?? 0;
          return (
            <>
              <div className='flex gap-4 sm:hidden'>
                {currentIndex > 0 ? (
                  <Button asChild variant='outline' size='icon'>
                    <Link
                      to={`/album/${albumId}/${
                        album?.images[currentIndex - 1].id
                      }`}
                    >
                      <ChevronLeft className='h-4 w-4'></ChevronLeft>
                    </Link>
                  </Button>
                ) : null}

                {currentIndex < (album?.images.length ?? 0) - 1 ? (
                  <Button asChild variant='outline' size='icon'>
                    <Link
                      to={`/album/${albumId}/${
                        album?.images[currentIndex + 1].id
                      }`}
                    >
                      <ChevronRight className='h-4 w-4'></ChevronRight>
                    </Link>
                  </Button>
                ) : null}
              </div>
              <div className='hidden px-20 sm:block sm:max-w-screen-sm md:max-w-screen-md'>
                <Carousel
                  className='w-full'
                  opts={{
                    startIndex: currentIndex,
                  }}
                >
                  <CarouselContent>
                    {album?.images.map((img, i) => (
                      <CarouselItem
                        className='basis-1/3  md:basis-1/5'
                        key={img.id}
                      >
                        <div className='flex justify-center'>
                          <Link
                            to={`/album/${albumId}/${img.id}`}
                            className='overflow-hidden rounded-lg'
                          >
                            <img
                              src={`/api/image/${img.id}?thumbnail`}
                              width={96}
                              height={96}
                              alt='fotografi'
                              className='aspect-square h-24 w-24 object-cover transition-transform hover:scale-105'
                              decoding='async'
                              loading='lazy'
                            />
                          </Link>
                        </div>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious />
                  <CarouselNext />
                </Carousel>
              </div>
            </>
          );
        }}
      </Await>
    </Suspense>
  );
}

export default function Page() {
  const { image, albumId, albumName } = useLoaderData<typeof loader>();

  return (
    <>
      <div className='mx-auto my-2 flex w-full max-w-screen-lg justify-between px-8'>
        <Button asChild variant='ghost' size='sm'>
          <Link to={`/album/${albumId}`}>
            <ChevronLeft className='mr-2 h-4 w-4'></ChevronLeft>
            <span>{albumName}</span>
          </Link>
        </Button>
        {/* <InfoDrawer image={image}></InfoDrawer> */}
      </div>
      <div className='mx-auto my-2 max-w-screen-lg px-8'>
        <img
          src={`/api/image/${image.id}?preview`}
          width={1200}
          height={800}
          alt='fotografi'
          className='w-full object-contain rounded-md'
        />
      </div>
      <div className='mx-auto my-2 flex w-full max-w-screen-lg justify-center'>
        <ImageCarousel albumId={albumId} imageId={image.id}></ImageCarousel>
      </div>
      <div className='mx-auto my-2 w-full max-w-screen-lg px-8'>
        <Card>
          <CardHeader>
            <CardTitle>Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 gap-2 text-sm sm:grid-cols-2'>
              <span>Fotograf</span>
              <span>{image.taken_by_name}</span>
              <span>Tagen vid</span>
              <span>{format(image.taken_at, 'PPP, pp', { locale: sv })}</span>
              <span>Format</span>
              <span>{image.mimetype}</span>
              <span>Märke</span>
              <span>{image.exif_data?.Image?.Make}</span>
              <span>Model</span>
              <span>{image.exif_data?.Image?.Model}</span>
              <span>Lins</span>
              <span>{image.exif_data?.Photo?.LensModel}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

import { Link } from '@remix-run/react';

export default function Page() {
  return (
    <section className='mx-auto mt-8 max-w-prose'>
      <h2 className='mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0'>
        Om oss
      </h2>
      <p className='leading-7 [&:not(:first-child)]:mt-6'>
        DFoto är Datateknologsektionens fotoförening. Vår ambition är att genom
        foto och film föreviga alla arrangemang Datateknologen går på. Allt
        ifrån iDrotts legendariska aktiviteter, till D6s storslagna fester och
        Deltas episka pubar.
      </p>

      <p className='leading-7 [&:not(:first-child)]:mt-6'>
        Du kan komma i kontakt med oss genom att maila{' '}
        <Link
          to='mailto:dfoto@dtek.se'
          className='font-medium text-primary underline underline-offset-4'
        >
          dfoto@dtek.se
        </Link>{' '}
        eller skriva till vår{' '}
        <Link
          to='https://www.facebook.com/dfotochalmers/'
          className='font-medium text-primary underline underline-offset-4'
        >
          Facebooksida
        </Link>
        .
      </p>

      <p className='text-xl font-semibold leading-7 [&:not(:first-child)]:mt-6'>
        Vi ses genom kameralinsen!
      </p>
    </section>
  );
}

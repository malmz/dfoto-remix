import { Form, Link, NavLink, Outlet, useLoaderData } from '@remix-run/react';
import { CircleUser, Mail } from 'lucide-react';
import { Input } from '~/components/ui/input';
import dataLogo from '~/assets/images/datalogo.svg';
import { getYear } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '~/components/ui/tooltip';
import { Button } from '~/components/ui/button';
import logo from '~/assets/icon.svg';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { authenticator } from '~/lib/auth.server';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '~/components/ui/avatar';

function UserProfile() {
  const { session } = useLoaderData<typeof loader>();
  const user = session?.user;

  return (
    <>
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='overflow-hidden rounded-full'
            >
              <Avatar>
                <AvatarImage src={user.image}></AvatarImage>
                <AvatarFallback className='uppercase'>
                  {user.name?.slice(0, 2) ?? <CircleUser className='h-5 w-5' />}
                </AvatarFallback>
              </Avatar>

              <span className='sr-only'>Toggle user menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>
              {user.name ?? user.email ?? 'Användare'}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            {true && (
              <DropdownMenuItem asChild>
                <Link to='/admin'>Admin</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Form action='/auth/logout' method='POST'>
                <button type='submit'>Sign out</button>
              </Form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Form action='/auth/keycloak'>
          <Button variant='outline' type='submit'>
            Sign in
          </Button>
        </Form>
      )}
    </>
  );
}

function Header() {
  return (
    <header className='flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6'>
      <nav className='flex items-center gap-6'>
        <Link to='/'>
          {/* <Camera className="h-6 w-6 text-primary"></Camera> */}
          <img
            src={logo}
            width='100'
            height='40'
            className='h-8 w-8'
            alt='DFoto'
          ></img>
          <span className='sr-only'>DFoto</span>
        </Link>
        <NavLink
          to='/'
          className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary aria-[current=true]:text-foreground'
        >
          Album
        </NavLink>
        <NavLink
          to='/about'
          className='text-sm font-medium text-muted-foreground transition-colors hover:text-primary aria-[current=true]:text-foreground'
        >
          Om oss
        </NavLink>
      </nav>
      <div className='flex items-center gap-2'>
        <form action='' className='flex items-center gap-2'>
          <Input type='search' placeholder='Sök...' className=''></Input>
        </form>
        <UserProfile></UserProfile>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className='mt-8 flex items-center justify-between gap-4 border-t p-4'>
      <aside className='flex items-center gap-2'>
        <img
          src={dataLogo}
          alt='Computer science logo'
          height={36}
          width={36}
        />
        <p className=''>
          Copyright © {getYear(new Date())} - All right reserved
        </p>
      </aside>
      <p className='text-lg font-medium text-muted-foreground'>
        Vi ses genom kameralinsen!
      </p>
      <div className='flex items-center gap-2'>
        {/*  <ThemeSwitcher></ThemeSwitcher> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant='ghost' size='icon' asChild>
              <a href='mailto:dfoto@dtek.se'>
                <Mail></Mail>
              </a>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Maila oss</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </footer>
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await authenticator.isAuthenticated(request);
  return { session };
}

export default function Layout() {
  return (
    <>
      <Header></Header>
      <main className='flex grow flex-col'>
        <Outlet></Outlet>
      </main>
      <Footer></Footer>
    </>
  );
}

import { Link, NavLink, Outlet } from "@remix-run/react";
import { Camera, Mail } from "lucide-react";
import { Input } from "~/components/ui/input";
import dataLogo from "~/assets/images/datalogo.svg";
import { getYear } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Button } from "~/components/ui/button";

function Header() {
  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b px-4 md:px-6">
      <nav className="flex items-center gap-6">
        <Link to="/">
          <Camera className="h-6 w-6 text-primary"></Camera>
          <span className="sr-only">DFoto</span>

          {/* <Image
            src='/images/logo.png'
            width='100'
            height='40'
            alt='DFoto logo'
            priority
          ></Image> */}
        </Link>
        <NavLink
          to="/"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary aria-[current=true]:text-foreground"
        >
          Album
        </NavLink>
        <NavLink
          to="/about"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary aria-[current=true]:text-foreground"
        >
          Om oss
        </NavLink>
      </nav>
      <div className="flex items-center gap-2">
        <form action="" className="flex items-center gap-2">
          <Input type="search" placeholder="Sök..." className=""></Input>
        </form>
        {/* <UserProfile></UserProfile> */}
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-8 flex items-center justify-between gap-4 border-t p-4">
      <aside className="flex items-center gap-2">
        <img
          src={dataLogo}
          alt="Computer science logo"
          height={36}
          width={36}
        />
        <p className="">
          Copyright © {getYear(new Date())} - All right reserved
        </p>
      </aside>
      <p className="text-lg font-medium text-muted-foreground">
        Vi ses genom kameralinsen!
      </p>
      <div className="flex items-center gap-2">
        {/*  <ThemeSwitcher></ThemeSwitcher> */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" asChild>
              <a href="mailto:dfoto@dtek.se">
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

export default function Layout() {
  return (
    <>
      <Header></Header>
      <main className="flex grow flex-col">
        <Outlet></Outlet>
      </main>
      <Footer></Footer>
    </>
  );
}

# Nya DFoto, på riktigt nu faktiskt!

Gamla DFoto är rätt najs men byggd med gammal react och mongodb. Nu kommer
spännande ny server side rendering och postgres. Sidan är skriven i remix med
styles från shadcn/ui.

## Configuration

Some environment variables are required for a functioning deployment.
In development they can be added to a `.env` file like:

```dotenv
SOME_VARIABLE=VALUE
OTHER_VARIABLE=COOL-VALUE
```

| Variable              | Example value                        |
| --------------------- | ------------------------------------ |
| DATABASE_URL          | postgresql://root:password@localhost |
| COOKIE_SECRET         | 9B36CD3E-78C9-47EF-9DAC-BC808C0C4E4F |
| KEYCLOAK_ENDPOINT     | http://localhost:8080/realms/dtek    |
| KEYCLOAK_CLIENTID     | dfoto                                |
| KEYCLOAK_CLIENTSECRET | xaTBTLnhxZ7cg2cfMzNP6aGo64RXIWN5     |
| KEYCLOAK_REDIRECTURI  | http://localhost:5173/auth/callback  |

## Hacking

To begin development on the service, install node dependencies.

```sh
$ npm install
```

Create a `.env` file like explained above, then start the extra service
containers in `compose.yml` using:

```sh
$ docker compose up -d
```

This starts a database running at `localhost:5432` and a keycloak auth server
at `localhost:8080` with an appropriate configuration (`misc/dtek-realm.json`).

Apply the database schema with:

```sh
$ npm run dk push
```

With all required services running you are now able to start the dev server and
start hacking.

```sh
$ npm run dev
```

Changes you make to the code will automatically be visible on save, no restart
or reload required.

### Authentication

Using the `compose.yml` file creates a keycloak instance with a preconfigured
realm called dtek. This realm has an oauth client configured called dfoto and
two default users.

- Keycloak Admin user for the dashboard: **admin:admin**
- Normal user for the dfoto app: **tester:supersecret**

The normal user have full permissions set for the dfoto app.

## Tech-stack motivation and ramblings

Hello future maintainers! As with all programming, a choice needed to be made
in the technology stack. For this project i picked react as a base, mostly
because of the wonderful shadcn/ui component library. To add server
functionality to react, a framework is needed. The two real choices(at the time)
are Next.js and Remix. This site used Next at first but migrated to Remix
because of general weirdness with Next (like requiring DB access at build time).
Of note is that at the time of writing (and probably still today) the webdev and
react world are in flux. React 19 is in RC status with major changes to how
server interaction is done. Next.js rebuilds its entire framework to match this
new model with noticeable growing pains. Remix has not bought into this model
yet and have instead decided to deprecate itself and be absorbed by its
underlying routing library, react-router (by the same team).

The path forward for this codebase is to migrate to react-router v7, according
to the Remix authors this should be relatively painless. Would be interesting
to see how Remix settles on react server components (RSC), first impressions
does not have me impressed but who knows.

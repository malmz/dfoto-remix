# Nya DFoto, på riktigt nu faktiskt!

Gammla DFoto är rätt najs men byggd med gammal react och mongodb. Nu kommer spännande ny server side rendering och postgres. Sidan är skriven i remix med styles från shadcn/ui.

## Configuration

Some environment variables are required for a fuctioning deployment. In development they can be added to a `.env` file like:

```dotenv
SOME_VARIABLE=VALUE
OTHER_VARIABLE=COOL-VALUE
```

| Variable              | Example value                         |
| --------------------- | ------------------------------------- |
| DATABASE_URL          |  postgresql://root:password@localhost |
| COOKIE_SECRET         | 9B36CD3E-78C9-47EF-9DAC-BC808C0C4E4F  |
| KEYCLOAK_ENDPOINT     | http://localhost/realms/dtek          |
| KEYCLOAK_CLIENTID     | dfoto                                 |
| KEYCLOAK_CLIENTSECRET | asdf1234qwerty67890                   |
| KEYCLOAK_REDIRECTURI  | http://localhost:5173/auth/callback   |

If you are using the docker compose to start the background services, use the following `.env` file

``` dotenv
DATABASE_URL=postgresql://root:password@localhost:5432
COOKIE_SECRET=9B36CD3E-78C9-47EF-9DAC-BC808C0C4E4F
KEYCLOAK_ENDPOINT=http://localhost:8080/realms/master
KEYCLOAK_CLIENTID=<CLIENTID>
KEYCLOAK_CLIENTSECRET=<CLIENTSECRET>
KEYCLOAK_REDIRECTURI=http://localhost:5173/auth/callback
```
replace `<CLIENTID>` and `<CLIENTSECRET>` by going to `localhost:8080`, logging in, and creating a client.
For name, choose `<CLIENTID>`, then choose `client authentication`.
Make sure to add `Valid redirect URI` from above.
Find the `<CLIENTSECRET>` by going to the client, and then credentials

## Hacking

To begin development on the service, start up the `compose.yml` using `docker compose up -d` for a database running at localhost at port 5432.
Proceed to run `npm install` to get the dependencies for the project.
For development using the compose postgres server, run `export DATABASE_URL=postgresql://root:password@localhost:5432`, and then run `npm run dk push`.
You are now able to run `npm run dev` to start the local service in dev mode to start hacking away at the code.

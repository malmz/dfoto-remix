# Nya DFoto, på riktigt nu faktiskt!

Gammla DFoto är rätt najs men byggd med gammal react och mongodb. Nu kommer spännande ny server side rendering och postgres. Sidan är skriven i remix med styles från shadcn/ui.

## Hacking
To begin development on the service, start up the `compose.yml` using `docker compose up -d` for a database running at localhost at port 5432.
Proceed to run `npm install` to get the dependencies for the project.
For development using the compose postgres server, run `export DATABASE_URL=postgresql://root:password@localhost:5432`, and then run `npm run dk push`.
You are now able to run `npm run dev` to start the local service in dev mode to start hacking away at the code.

### Hint
Instead of running `export DATABASE_URL=postgresql://root:password@localhost:5432` each time you start working, you can instead place `export DATABASE_URL=postgresql://root:password@localhost:5432` in `.env`.
You can even point it to another database than the one running in the docker container.

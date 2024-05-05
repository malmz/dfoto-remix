import { Authenticator } from 'remix-auth';
import { KeycloakStrategy } from 'remix-keycloak';
import { sessionStorage } from './session.server';
import { gravatarUrl } from './utils';

export type Session = {
  user?: {
    id: string;
    name: string;
    email: string;
    image: string;
  };
};

// Create an instance of the authenticator, pass a generic with what your
// strategies will return and will be stored in the session
export const authenticator = new Authenticator<Session>(sessionStorage);

let keycloakStrategy = new KeycloakStrategy(
  {
    useSSL: true,
    domain: process.env.KEYCLOAK_DOMAIN!,
    realm: process.env.KEYCLOAK_REALM!,
    clientID: process.env.KEYCLOAK_CLIENT_ID!,
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET!,
    callbackURL: process.env.KEYCLOAK_CALLBACK_URL!,
  },
  async ({ accessToken, refreshToken, extraParams, profile }) => {
    console.log({ accessToken, refreshToken, extraParams, profile });

    const user = {
      id: profile.id,
      name: profile.displayName,
      email: profile._json.email,
      image:
        profile.photos?.[0].value ?? (await gravatarUrl(profile._json.email)),
    };

    return { user };
  }
);

authenticator.use(keycloakStrategy);

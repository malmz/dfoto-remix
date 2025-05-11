export type UserClaims = {
	sub: string;
	name: string;
	email: string;
} & Record<string, any>;

export interface UserState {
	claims: UserClaims;
	roles: string[];
	accessToken: string;
	accessTokenExpiresAt: Date;
	refreshToken?: string;
	refreshTokenExpiresAt?: Date;
}

export interface SessionState {
	user: UserState;
	state: string;
	codeVerifier: string;
	returnTo: string;
}

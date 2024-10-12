export interface UserState {
	claims: Record<string, string>;
	roles: string[];
	accessToken: string;
	accessTokenExpiresAt: Date;
	refreshToken?: string;
	refreshTokenExpiresAt?: Date;
}

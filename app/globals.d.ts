import type { Session } from 'react-router';
import type { SessionState } from './lib/types';

declare module 'react-router' {
	interface AppLoadContext {
		session: Session<SessionState>;
	}
}

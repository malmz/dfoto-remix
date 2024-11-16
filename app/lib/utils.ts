import { useFormAction, useNavigation } from '@remix-run/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

const getSHA256Hash = async (input: string) => {
	const textAsBuffer = new TextEncoder().encode(input);
	const hashBuffer = await crypto.subtle.digest('SHA-256', textAsBuffer);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hash = hashArray
		.map((item) => item.toString(16).padStart(2, '0'))
		.join('');
	return hash;
};

export async function gravatarUrl(email: string): Promise<string> {
	const trimmed = email.trim().toLowerCase();
	const hashed = await getSHA256Hash(trimmed);
	return `https://www.gravatar.com/avatar/${hashed}`;
}

export function assertResponse(
	value: any,
	message?: string,
	responseInit?: ResponseInit,
): asserts value {
	if (!value) {
		throw new Response(message ?? 'Invariant failed', {
			status: 400,
			...responseInit,
		});
	}
}

/**
 * Returns true if the current navigation is submitting the current route's
 * form. Defaults to the current route's form action and method POST.
 */
export function useIsSubmitting({
	formAction,
	formMethod = 'POST',
}: {
	formAction?: string;
	formMethod?: 'POST' | 'GET' | 'PUT' | 'PATCH' | 'DELETE';
} = {}) {
	const contextualFormAction = useFormAction();
	const navigation = useNavigation();
	return (
		navigation.state === 'submitting' &&
		navigation.formAction === (formAction ?? contextualFormAction) &&
		navigation.formMethod === formMethod
	);
}

export const maxFileSize = 30_000_000;

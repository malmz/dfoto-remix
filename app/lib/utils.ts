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

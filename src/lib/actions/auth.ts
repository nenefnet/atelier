'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ACTIVE_WORKSPACE_COOKIE } from '@/lib/workspace';

export async function setActiveWorkspace(workspaceId: string) {
  cookies().set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: '/',
    httpOnly: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath('/', 'layout');
}

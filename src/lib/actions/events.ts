'use server';

import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { getCurrentUser, resolveActiveWorkspace } from '@/lib/workspace';

export async function logEvent(name: string, props: Record<string, unknown> = {}) {
  const user = await getCurrentUser();
  if (!user?.id) return;
  const ws = await resolveActiveWorkspace(user.id);
  await db.insert(events).values({
    name,
    props,
    userId: user.id,
    workspaceId: ws?.id ?? null,
  });
}

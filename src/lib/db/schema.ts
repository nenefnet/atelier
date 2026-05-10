import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  index,
  uniqueIndex,
} from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// ---------------------------------------------------------------------------
// User table — kept lean since Auth.js was removed for the demo deployment.
// (account, session, verificationToken tables can be added later if you wire
// real auth back in.)
// ---------------------------------------------------------------------------

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => nanoid()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image'),
  createdAt: integer('createdAt', { mode: 'timestamp_ms' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// ---------------------------------------------------------------------------
// Domain tables
// ---------------------------------------------------------------------------

export const workspaces = sqliteTable(
  'workspace',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    ownerId: text('ownerId')
      .notNull()
      .references(() => users.id),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    slugIdx: uniqueIndex('workspace_slug_idx').on(t.slug),
    ownerIdx: index('workspace_owner_idx').on(t.ownerId),
  }),
);

export const workspaceMembers = sqliteTable(
  'workspace_member',
  {
    workspaceId: text('workspaceId')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    role: text('role', { enum: ['owner', 'admin', 'member'] }).notNull().default('member'),
    joinedAt: integer('joinedAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.workspaceId, t.userId] }),
    userIdx: index('workspace_member_user_idx').on(t.userId),
  }),
);

export const invitations = sqliteTable(
  'invitation',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspaceId')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    role: text('role', { enum: ['admin', 'member'] }).notNull().default('member'),
    token: text('token')
      .notNull()
      .unique()
      .$defaultFn(() => nanoid(32)),
    status: text('status', { enum: ['pending', 'accepted', 'revoked', 'expired'] })
      .notNull()
      .default('pending'),
    invitedBy: text('invitedBy')
      .notNull()
      .references(() => users.id),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    expiresAt: integer('expiresAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)),
    acceptedAt: integer('acceptedAt', { mode: 'timestamp_ms' }),
  },
  (t) => ({
    workspaceIdx: index('invitation_workspace_idx').on(t.workspaceId),
    emailIdx: index('invitation_email_idx').on(t.email),
  }),
);

export const projects = sqliteTable(
  'project',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspaceId')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    description: text('description'),
    archived: integer('archived', { mode: 'boolean' }).notNull().default(false),
    createdBy: text('createdBy')
      .notNull()
      .references(() => users.id),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceIdx: index('project_workspace_idx').on(t.workspaceId),
  }),
);

export const tasks = sqliteTable(
  'task',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspaceId')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: text('projectId').references(() => projects.id, { onDelete: 'set null' }),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status', { enum: ['todo', 'doing', 'blocked', 'done'] })
      .notNull()
      .default('todo'),
    priority: text('priority', { enum: ['low', 'normal', 'high'] }).notNull().default('normal'),
    dueAt: integer('dueAt', { mode: 'timestamp_ms' }),
    assigneeId: text('assigneeId').references(() => users.id, { onDelete: 'set null' }),
    createdBy: text('createdBy')
      .notNull()
      .references(() => users.id),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    completedAt: integer('completedAt', { mode: 'timestamp_ms' }),
  },
  (t) => ({
    workspaceIdx: index('task_workspace_idx').on(t.workspaceId),
    projectIdx: index('task_project_idx').on(t.projectId),
    assigneeIdx: index('task_assignee_idx').on(t.assigneeId),
  }),
);

export const notes = sqliteTable(
  'note',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => nanoid()),
    workspaceId: text('workspaceId')
      .notNull()
      .references(() => workspaces.id, { onDelete: 'cascade' }),
    projectId: text('projectId').references(() => projects.id, { onDelete: 'set null' }),
    title: text('title').notNull().default('Untitled'),
    body: text('body').notNull().default(''),
    createdBy: text('createdBy')
      .notNull()
      .references(() => users.id),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updatedAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceIdx: index('note_workspace_idx').on(t.workspaceId),
  }),
);

export const events = sqliteTable(
  'event',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    workspaceId: text('workspaceId').references(() => workspaces.id, { onDelete: 'cascade' }),
    userId: text('userId').references(() => users.id, { onDelete: 'set null' }),
    name: text('name').notNull(),
    props: text('props', { mode: 'json' }).notNull().$type<Record<string, unknown>>().default(sql`'{}'`),
    createdAt: integer('createdAt', { mode: 'timestamp_ms' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => ({
    workspaceCreatedIdx: index('event_workspace_created_idx').on(t.workspaceId, t.createdAt),
    nameIdx: index('event_name_idx').on(t.name),
  }),
);

// ---------------------------------------------------------------------------
// Inferred types
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type Workspace = typeof workspaces.$inferSelect;
export type WorkspaceMember = typeof workspaceMembers.$inferSelect;
export type Invitation = typeof invitations.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Note = typeof notes.$inferSelect;
export type Event = typeof events.$inferSelect;

export type MemberRole = 'owner' | 'admin' | 'member';
export type TaskStatus = 'todo' | 'doing' | 'blocked' | 'done';
export type TaskPriority = 'low' | 'normal' | 'high';
export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

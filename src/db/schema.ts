import { text, boolean, uuid, pgTable } from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('name'),
  password: text('password'),
});

export const todo = pgTable('todo', {
  id: uuid('id').defaultRandom().primaryKey(),
  text: text('text').notNull(),
  done: boolean('done').default(false).notNull(),
  userId: uuid('user_id').references(() => user.id),
});

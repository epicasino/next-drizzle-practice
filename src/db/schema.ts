import { relations } from 'drizzle-orm';
import { text, boolean, uuid, pgTable, integer } from 'drizzle-orm/pg-core';

export const user = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  todos: many(todo),
}));

export const todo = pgTable('todo', {
  id: uuid('id').primaryKey(),
  text: text('text').notNull(),
  done: boolean('done').default(false).notNull(),
  userId: uuid('user_id')
    .notNull()
    .references(() => user.id),
});

export const todoRelations = relations(todo, ({ one }) => ({
  user: one(user, {
    fields: [todo.userId],
    references: [user.id],
  }),
}));

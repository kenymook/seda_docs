import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const tokenDocuments=sqliteTable('token_documents',{id:text('id').primaryKey(),sourceHash:text('source_hash').notNull(),revision:integer('revision').notNull(),editsJson:text('edits_json').notNull(),updatedAt:text('updated_at').notNull()});
export const tokenHistory=sqliteTable('token_history',{revision:integer('revision').primaryKey(),sourceHash:text('source_hash').notNull(),editsJson:text('edits_json').notNull(),updatedAt:text('updated_at').notNull()});

import { z } from "zod"
import { relations } from "drizzle-orm";
import {
    integer,
    bigint,
    pgTable,
    text,
    timestamp
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod"

export const accounts = pgTable("accounts", {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id"),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
})

export const accountsRelations = relations(accounts, ({ many }) => ({
    transactions: many(transactions),
    transactionTemplates: many(transactionTemplates),
}))

export const insertAccountSchema = createInsertSchema(accounts)

export const categories = pgTable("categories", {
    id: text("id").primaryKey(),
    plaidId: text("plaid_id"),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
})

export const categoriesRelations = relations(categories, ({ many }) => ({
    transactions: many(transactions),
    transactionTemplates: many(transactionTemplates),
}))

export const insertCategoriesSchema = createInsertSchema(categories)

export const transactions = pgTable("transactions", {
    id: text("id").primaryKey(),
    amount: bigint("amount", { mode: "number" }).notNull(),
    payee: text("payee").notNull(),
    notes: text("notes"),
    date: timestamp("date", { mode: "date" }).notNull(),
    accountId: text("account_id").references(() => accounts.id, {
        onDelete: "cascade"
    }).notNull(),
    categoryId: text("category_id").references(() => categories.id, {
        onDelete: "set null"
    }),

})

export const transactionsRelations = relations(transactions, ({ one }) => ({
    accounts: one(accounts, {
        fields: [transactions.accountId],
        references: [accounts.id],
    }),
    categories: one(categories, {
        fields: [transactions.categoryId],
        references: [categories.id],
    })
}))

export const insertTransactionSchema = createInsertSchema(transactions, {
    date: z.coerce.date(),
})

export const transactionTemplates = pgTable("transaction_templates", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    userId: text("user_id").notNull(),
    amount: bigint("amount", { mode: "number" }),
    payee: text("payee").notNull(),
    notes: text("notes"),
    accountId: text("account_id").references(() => accounts.id, {
        onDelete: "set null"
    }),
    categoryId: text("category_id").references(() => categories.id, {
        onDelete: "set null"
    }),
})

export const transactionTemplatesRelations = relations(transactionTemplates, ({ one }) => ({
    accounts: one(accounts, {
        fields: [transactionTemplates.accountId],
        references: [accounts.id],
    }),
    categories: one(categories, {
        fields: [transactionTemplates.categoryId],
        references: [categories.id],
    })
}))

export const insertTransactionTemplateSchema = createInsertSchema(transactionTemplates)
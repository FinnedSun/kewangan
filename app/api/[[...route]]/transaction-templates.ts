import { Hono } from "hono";
import { db } from "@/db/drizzle";
import {
  transactionTemplates,
  insertTransactionTemplateSchema,
  categories,
  accounts
} from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { and, eq, inArray } from "drizzle-orm";
import { zValidator } from "@hono/zod-validator"
import { createId } from "@paralleldrive/cuid2"
import { z } from "zod";

const app = new Hono()
  .get(
    "/",
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const data = await db
        .select({
          id: transactionTemplates.id,
          name: transactionTemplates.name,
          category: categories.name,
          categoryId: transactionTemplates.categoryId,
          payee: transactionTemplates.payee,
          amount: transactionTemplates.amount,
          notes: transactionTemplates.notes,
          account: accounts.name,
          accountId: transactionTemplates.accountId,
        })
        .from(transactionTemplates)
        .leftJoin(accounts, eq(transactionTemplates.accountId, accounts.id))
        .leftJoin(categories, eq(transactionTemplates.categoryId, categories.id))
        .where(
          eq(transactionTemplates.userId, auth.userId)
        )

      return c.json({ data })
    }
  )
  .get(
    "/:id",
    zValidator("param", z.object({
      id: z.string().optional()
    })),
    clerkMiddleware(),
    async (c) => {
      const auth = getAuth(c)
      const { id } = c.req.valid("param")

      if (!id) {
        return c.json({ error: "Missing id" }, 400)
      }

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const [data] = await db
        .select({
          id: transactionTemplates.id,
          name: transactionTemplates.name,
          categoryId: transactionTemplates.categoryId,
          payee: transactionTemplates.payee,
          amount: transactionTemplates.amount,
          notes: transactionTemplates.notes,
          accountId: transactionTemplates.accountId,
        })
        .from(transactionTemplates)
        .where(
          and(
            eq(transactionTemplates.id, id),
            eq(transactionTemplates.userId, auth.userId),
          ),
        )
        
      if (!data) {
        return c.json({ error: "Not found" }, 404)
      }

      return c.json({ data })
    }
  )
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertTransactionTemplateSchema.omit({
      id: true,
      userId: true,
    })),
    async (c) => {
      const auth = getAuth(c)
      const values = c.req.valid("json")

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const [data] = await db.insert(transactionTemplates).values({
        id: createId(),
        userId: auth.userId,
        ...values,
      }).returning()

      return c.json({ data })
    }
  )
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      }),
    ),
    async (c) => {
      const auth = getAuth(c)
      const values = c.req.valid("json")

      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const data = await db
        .delete(transactionTemplates)
        .where(
          and(
            eq(transactionTemplates.userId, auth.userId),
            inArray(transactionTemplates.id, values.ids)
          )
        )
        .returning({
          id: transactionTemplates.id
        })

      return c.json({ data })
    }
  )
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional()
      })
    ),
    zValidator("json", insertTransactionTemplateSchema.omit({
      id: true,
      userId: true,
    })),
    async (c) => {
      const auth = getAuth(c)
      const { id } = c.req.valid("param")
      const values = c.req.valid("json")

      if (!id) {
        return c.json({ error: "Missing id" }, 400)
      }
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const [data] = await db
        .update(transactionTemplates)
        .set(values)
        .where(
          and(
            eq(transactionTemplates.id, id),
            eq(transactionTemplates.userId, auth.userId)
          )
        )
        .returning()

      if (!data) {
        return c.json({ error: "Not found" }, 404)
      }

      return c.json({ data })
    }
  )
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional()
      })
    ),
    async (c) => {
      const auth = getAuth(c)
      const { id } = c.req.valid("param")

      if (!id) {
        return c.json({ error: "Missing id" }, 400)
      }
      if (!auth?.userId) {
        return c.json({ error: "Unauthorized" }, 401)
      }

      const [data] = await db
        .delete(transactionTemplates)
        .where(
          and(
            eq(transactionTemplates.id, id),
            eq(transactionTemplates.userId, auth.userId)
          )
        )
        .returning({
          id: transactionTemplates.id
        })

      if (!data) {
        return c.json({ error: "Not found" }, 404)
      }

      return c.json({ data })
    }
  )

export default app

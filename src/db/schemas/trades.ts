import {
  varchar,
  mysqlTable,
  mysqlEnum,
  timestamp,
  decimal,
  check,
} from "drizzle-orm/mysql-core";
import { Users } from "./users";
import { relations, sql } from "drizzle-orm";
import { Orders } from "./orders";
export const Trades = mysqlTable(
  "trades",
  {
    id: varchar("id", { length: 36 }).primaryKey().notNull().unique(), // Unique identifier for each trade
    postType: mysqlEnum("postType", ["sell", "buy"]).notNull(), // Type of trade (sell or buy)
    coffeeType: mysqlEnum("coffeeType", ["green", "parchment"]).notNull(), // Type of coffee
    quantity: decimal("quantity", { precision: 10 }).notNull(), // Quantity of coffee traded
    unit: mysqlEnum("unit", ["kg", "tons"]).notNull(), // Unit of measurement
    price: decimal("price", { precision: 10 }).notNull(), // Price of the trade
    district: varchar("district", { length: 50 }), // District where the trade takes place
    status: mysqlEnum("status", ["unlock", "locked"]).default("unlock"),
    posterId: varchar("posterId", { length: 36 })
      .notNull()
      .references(() => Users.id, { onDelete: "cascade" }), // Foreign key referencing user ID
    createdAt: timestamp("createdAt").defaultNow(), // Creation timestamp
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(), // Updated timestamp
  },
  (t) => ({
    quantityCheck: check("quantity_check", sql`${t.quantity} > 0`), // Constraint to ensure quantity is positive
    priceCheck: check("price_check", sql`${t.price} >= 0`), // Constraint to ensure price is non-negative
  })
);

// Trade Relationship: One-to-One belong to user
export const tradesRelations = relations(Trades, ({ one }) => ({
  user: one(Users, {
    fields: [Trades.posterId],
    references: [Users.id],
  }),
  order: one(Orders), // One-to-One relationship with order
}));

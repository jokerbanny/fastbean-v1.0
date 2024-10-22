import {
  varchar,
  mysqlTable,
  mysqlEnum,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";
import { Trades } from "./trades"; // Import the trades table
import { relations } from "drizzle-orm";
import { Users } from "./users";

export const Orders = mysqlTable("orders", {
  id: varchar("id", { length: 36 }).primaryKey().notNull().unique(),
  tradeId: varchar("tradeId", { length: 36 })
    .references(() => Trades.id, {
      onDelete: "set default",
    })
    .default("noId"),
  coffeeType: mysqlEnum("coffeeType", ["green", "parchment"]).notNull(),
  postType: mysqlEnum("postType", ["sell", "buy"]).notNull(),
  quantity: decimal("quantity", { precision: 10 }).notNull(),
  unit: mysqlEnum("unit", ["kg", "tons"]).default("kg"),
  totalPrice: decimal("totalPrice", { precision: 10 }).notNull(),
  userPoster: varchar("userPoster", { length: 36 })
    .references(() => Users.id, {
      onDelete: "set default",
    })
    .default("noId"),
  seller: varchar("sellerId", { length: 36 }).notNull(),
  buyer: varchar("buyerId", { length: 36 }).notNull(),
  orderStatus: mysqlEnum("orderStatus", [
    "pending",
    "shipped",
    "delivered",
    "cancelled",
  ]).default("pending"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(),
});

// Define relationships between orders, users, and trades
export const orderRelations = relations(Orders, ({ one }) => ({
  trade: one(Trades, {
    fields: [Orders.tradeId], // Define relation to orders table
    references: [Trades.id], // Reference to trades table's id
  }),
  userPoster: one(Users, {
    fields: [Orders.userPoster], // Define relation to orders table
    references: [Users.id], // Reference to users table's id
  }),
}));

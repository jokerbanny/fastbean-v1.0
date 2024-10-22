import {
  int,
  varchar,
  mysqlTable,
  mysqlEnum,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { Addresses } from "./addresses";
import { Trades } from "./trades";
import { Orders } from "./orders";

export const Users = mysqlTable("users", {
  id: varchar("id", { length: 36 }).primaryKey().unique().notNull(), // UUID stored as varchar with length 36
  fName: varchar("fname", { length: 191 }), // First name
  lName: varchar("lname", { length: 191 }), // Last name
  username: varchar("username", { length: 191 }).notNull(), // Username
  email: varchar("email", { length: 191 }).unique().notNull(), // Email address
  phone: varchar("phone", { length: 20 }), // Phone number
  password: varchar("password", { length: 191 }).notNull(), // Password
  gender: mysqlEnum("gender", ["male", "female", "other"])
    .default("other")
    .notNull(), // Gender
  age: int("age").default(0), // Age
  photo: varchar("photo", { length: 191 }), // Photo URL
  verified: boolean("verified").default(false), // Verification status
  imagesURL: text("imagesURL"), // Additional images
  roles: mysqlEnum("roles", ["admin", "helper", "buyer", "seller"])
    .default("seller")
    .notNull(), // User roles
  createdAt: timestamp("createdAt").defaultNow(), // Creation timestamp
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow(), // Updated timestamp
});

// User Relationship: One-to-One | One-to-Many | Many-to-Many
export const usersRelations = relations(Users, ({ one, many }) => ({
  addresses: many(Addresses), // One-to-Many relationship with addresses
  trades: many(Trades), // One-to-Many relationship with trades
  order: many(Orders), // One-to-Many relationship with trades
}));

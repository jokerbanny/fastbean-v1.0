import { varchar, mysqlTable, int } from "drizzle-orm/mysql-core";
import { Users } from "./users";
import { relations } from "drizzle-orm";

export const Addresses = mysqlTable("addresses", {
  id: varchar("id", { length: 36 }).primaryKey().notNull().unique(), // Primary key for the address
  district: varchar("district", { length: 50 }), // District
  village: varchar("village", { length: 50 }).notNull(), // Village
  city: varchar("city", { length: 50 }).notNull(), // City
  province: varchar("province", { length: 50 }).notNull(), // Province
  homeNo: int("homeNo"), // Home number
  userId: varchar("userId)", { length: 36 }) // Ensure this matches the type in users
    .notNull()
    .references(() => Users.id, { onDelete: "cascade" }), // Foreign key referencing user ID
});

// Address Relationship: belongs to User
export const addressRelations = relations(Addresses, ({ one }) => ({
  user: one(Users, {
    fields: [Addresses.userId],
    references: [Users.id],
  }),
}));

import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Projects created by users
  projects: defineTable({
    userId: v.id("users"),
    name: v.string(),
    description: v.string(),
    currentVersionId: v.optional(v.id("versions")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Version history for each project
  versions: defineTable({
    projectId: v.id("projects"),
    versionNumber: v.number(),
    files: v.array(v.object({
      path: v.string(),
      content: v.string(),
      language: v.string(),
    })),
    prompt: v.string(), // The prompt that generated this version
    changeDescription: v.string(), // AI-generated description of changes
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),

  // Chat messages for AI interactions
  messages: defineTable({
    projectId: v.id("projects"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    createdAt: v.number(),
  }).index("by_project", ["projectId"]),
});

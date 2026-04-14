import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) return null;
    return project;
  },
});

export const create = mutation({
  args: { name: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    return await ctx.db.insert("projects", {
      userId,
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    currentVersionId: v.optional(v.id("versions")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.currentVersionId !== undefined) updates.currentVersionId = args.currentVersionId;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.id);
    if (!project || project.userId !== userId) throw new Error("Not found");

    // Delete all versions
    const versions = await ctx.db
      .query("versions")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    for (const version of versions) {
      await ctx.db.delete(version._id);
    }

    // Delete all messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_project", (q) => q.eq("projectId", args.id))
      .collect();
    for (const message of messages) {
      await ctx.db.delete(message._id);
    }

    await ctx.db.delete(args.id);
  },
});

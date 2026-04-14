import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return [];

    return await ctx.db
      .query("versions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("versions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const version = await ctx.db.get(args.id);
    if (!version) return null;

    const project = await ctx.db.get(version.projectId);
    if (!project || project.userId !== userId) return null;

    return version;
  },
});

export const create = mutation({
  args: {
    projectId: v.id("projects"),
    files: v.array(v.object({
      path: v.string(),
      content: v.string(),
      language: v.string(),
    })),
    prompt: v.string(),
    changeDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) throw new Error("Not found");

    // Get the latest version number
    const versions = await ctx.db
      .query("versions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(1);

    const versionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

    const versionId = await ctx.db.insert("versions", {
      projectId: args.projectId,
      versionNumber,
      files: args.files,
      prompt: args.prompt,
      changeDescription: args.changeDescription,
      createdAt: Date.now(),
    });

    // Update project's current version
    await ctx.db.patch(args.projectId, {
      currentVersionId: versionId,
      updatedAt: Date.now(),
    });

    return versionId;
  },
});

export const getLatestByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== userId) return null;

    const versions = await ctx.db
      .query("versions")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .order("desc")
      .take(1);

    return versions[0] || null;
  },
});

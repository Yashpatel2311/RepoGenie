import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { pollCommits } from "@/lib/github";
import { indexGithubRepo } from "@/lib/github-loader";
import { User } from "lucide-react";

export const projectRouter: ReturnType<typeof createTRPCRouter> =
  createTRPCRouter({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          githubUrl: z.string(),
          githubToken: z.string().optional(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        // Verify user exists
        const user = await ctx.db.user.findUnique({
          where: { id: ctx.user.userId! },
        });

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        const project = await ctx.db.project.create({
          data: {
            githubUrl: input.githubUrl,
            name: input.name,
            userToProject: {
              create: {
                userId: user.id,
              },
            },
          },
        });
        await indexGithubRepo(project.id, input.githubUrl, input.githubToken);
        await pollCommits(project.id);
        // If a GitHub token is provided, store it securely
        return project;
      }),
    getProjects: protectedProcedure.query(async ({ ctx }) => {
      return ctx.db.project.findMany({
        where: {
          userToProject: {
            some: {
              userId: ctx.user.userId!,
            },
          },
          deletedAt: null,
        },
      });
    }),
    getCommits: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ ctx, input }) => {
        // pollCommits(input.projectId).then().catch(console.error);
        const commits = await ctx.db.commit.findMany({
          where: { projectId: input.projectId },
        });
        return commits;
      }),
    saveAnswer: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          question: z.string(),
          answer: z.string(),
          fileReferences: z.any(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        return await ctx.db.question.create({
          data: {
            answer: input.answer,
            question: input.question,
            projectId: input.projectId,
            fileReferences: input.fileReferences,
            userId: ctx.user.userId!,
          },
        });
      }),
    getQuestions: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
        }),
      )
      .query(async ({ ctx, input }) => {
        return await ctx.db.question.findMany({
          where: { projectId: input.projectId },
          include: {
            user: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });
      }),
    uploadMeeting: protectedProcedure
      .input(
        z.object({
          projectId: z.string(),
          meetingUrl: z.string(),
          name: z.string(),
        }),
      )
      .mutation(async ({ ctx, input }) => {
        const meeting = await ctx.db.meeting.create({
          data: {
            projectId: input.projectId,
            meetingUrl: input.meetingUrl,
            name: input.name,
            status: "PROCESSING",
          },
        });
        return meeting;
      }),
    getMeetings: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findMany({
          where: { projectId: input.projectId },
          include: {
            issues: true,
          },
        });
      }),
    getMeetingById: protectedProcedure
      .input(z.object({ meetingId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.meeting.findUnique({
          where: { id: input.meetingId },
          include: { issues: true },
        });
      }),
    deleteMeeting: protectedProcedure
      .input(z.object({ meetingId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (!input.meetingId || typeof input.meetingId !== "string") {
          // This case should ideally be caught by Zod validation, but as a fallback
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid meeting ID!",
          });
        }
        return await ctx.db.meeting.delete({ where: { id: input.meetingId } });
      }),
    archiveProject: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        return await ctx.db.project.update({
          where: { id: input.projectId },
          data: { deletedAt: new Date() },
        });
      }),
    getTeamMembers: protectedProcedure
      .input(z.object({ projectId: z.string() }))
      .query(async ({ ctx, input }) => {
        return await ctx.db.userToProject.findMany({
          where: { projectId: input.projectId },
          include: { user: true },
        });
      }),
  });

import { db } from "@/server/db";
import { headers } from "next/headers";
import { Octokit } from "octokit";
import { aisummariseCommit } from "./gemini";
import axios from "axios";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// const githubUrl = "https://github.com/docker/genai-stack";

// Define the structure of the commit response
type Response = {
  commitHash: string;
  commitMessage: string;
  commitAuthorName: string;
  commitAuthorAvatar: string;
  commitDate: string;
};
// Fetch latest 10 commits from a GitHub repo
export const getCommitHashes = async (
  githubUrl: string,
): Promise<Response[]> => {
  const [owner, repo] = githubUrl.split("/").slice(-2);
  if (!owner || !repo) {
    throw new Error("Invalid GitHub URL");
  }

  const response = await octokit.rest.repos.listCommits({
    owner,
    repo,
  });

  const sortedCommits = response.data.sort((a: any, b: any) => {
    return (
      new Date(b.commit.author?.date).getTime() -
      new Date(a.commit.author?.date).getTime()
    );
  });
  //Return commit details in required format
  return sortedCommits.slice(0, 10).map((commit: any) => ({
    commitHash: commit.sha as string,
    commitMessage: commit.commit?.message ?? "",
    commitAuthorName: commit.commit?.author?.name ?? "",
    commitAuthorAvatar: commit.author?.avatar_url ?? "",
    commitDate: commit.commit?.author?.date ?? "",
  }));
};

// Poll commits from a GitHub repo that are not yet processed
export const pollCommits = async (projectId: string) => {
  const { project, githubUrl } = await fetchProjectGithubUrl(projectId);
  if (!githubUrl) {
    throw new Error("GitHub URL is missing for the project.");
  }
  const commitHashes = await getCommitHashes(githubUrl);
  const unprocessedCommits = await filterUnprocessedCommits(
    projectId,
    commitHashes,
  );
  const summaryResponse = await Promise.allSettled(
    unprocessedCommits.map((commit) => {
      return summariseCommit(githubUrl, commit.commitHash);
    }),
  );

  const summaries = summaryResponse.map((response) => {
    if (response.status === "fulfilled") {
      return response.value as string;
    } else {
      console.error("Error summarising commit:", response.reason);
      return null;
    }
  });

  const commits = await db.commit.createMany({
    data: summaries.map((summary, index) => {
      console.log(
        `Processing commit ${index + 1} of ${unprocessedCommits.length}: ${unprocessedCommits[index]?.commitHash}`,
      );
      return {
        // projectId,
        // commitHash: unprocessedCommits[index]?.commitHash ?? "",
        // commitMessage: unprocessedCommits[index]?.commitMessage ?? "",
        // commitAuthorName: unprocessedCommits[index]?.commitAuthorName ?? "",
        // commitAuthorAvatar: unprocessedCommits[index]?.commitAuthorAvatar ?? "",
        // commitDate: unprocessedCommits[index]?.commitDate ?? "",
        // summary: summary || "",
        projectId: projectId,
        commitHash: unprocessedCommits[index]!.commitHash,
        commitMessage: unprocessedCommits[index]!.commitMessage,
        commitAuthorName: unprocessedCommits[index]!.commitAuthorName,
        commitAuthorAvatar: unprocessedCommits[index]!.commitAuthorAvatar,
        commitDate: unprocessedCommits[index]!.commitDate,
        summary: summary || "",
      };
    }),
  });
  return commits;
};

async function summariseCommit(githubUrl: string, commitHash: string) {
  //get the diff for the commit then pass it to the AI summariser
  const { data } = await axios.get(`${githubUrl}/commit/${commitHash}.diff`, {
    headers: {
      Accept: "application/vnd.github.v3.diff",
    },
  });
  return (await aisummariseCommit(data)) || "";
}

// Fetch the GitHub repo URL for a project from the database
async function fetchProjectGithubUrl(projectId: string) {
  const project = await db.project.findUnique({
    where: { id: projectId },
    select: { githubUrl: true },
  });
  if (!project?.githubUrl) {
    throw new Error("Project not found or GitHub URL is missing.");
  }
  return { project, githubUrl: project?.githubUrl };
}

// Compare fetched commits with DB records and return only unprocessed ones
async function filterUnprocessedCommits(
  projectId: string,
  commitHashes: Response[],
) {
  const processedCommits = await db.commit.findMany({
    where: { projectId },
    // select: { commitHash: true },
  });
  const unprocessedCommits = commitHashes.filter(
    (commit) =>
      !processedCommits.some(
        (processedCommit) => processedCommit.commitHash === commit.commitHash,
      ),
  );
  return unprocessedCommits;
}

// await pollCommits("9f4acada-8279-4f93-a5ca-1013e304b05b").then(console.log);

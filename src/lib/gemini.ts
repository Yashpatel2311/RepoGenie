// import "dotenv/config";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// if (!process.env.GOOGLE_API_KEY) {
//   throw new Error("GOOGLE_API_KEY environment variable is not set");
// }

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export const aisummariseCommit = async (diff: string) => {
//   try {
//     const response = await model.generateContent([
//       `You are an expert programmer, and you are trying to summarize a git diff.
// Reminders about the git diff format:
// For every file, there are a few metadata lines, like (for example):
// \`\`\`
// diff --git a/lib/index.js b/lib/index.js
// index aadf691..bfef603 100644
// --- a/lib/index.js
// +++ b/lib/index.js
// \`\`\`
// This means that the file \`lib/index.js\` was modified in this commit.Note that this is only an example.
// Then there is a specifier of the lines that were modified.
// A line starting with \`+\` means it was added.
// A line that starting with \`-\` means that line was deleted.
// A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding.
// It is not part of the diff.
// [...]
// EXAMPLE SUMMARY COMMENTS:
// \`\`\`
// * Raised the amount of returned recordings from \`10\` to \`100\` [packages/server/recordings_api.ts], [packages/server/constants.ts]
// * Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
// * Moved the \`octokit\` initialization to a separate file [src/octokit.ts], [src/index.ts]
// * Added an OpenAI API for completions [packages/utils/apis/openai.ts]
// * Lowered numeric tolerance for test files
// \`\`\`

// Most commits will have less comments than this examples list.
// The last comment does not include the file names,
// because there were more than two relevant files in the hypothetical commit.
// Do not include parts of the example in your summary.
// It is given only as an example of appropriate comments.`,

//       `Please summarise the following diff file: \n\n${diff}`,
//     ]);
//     return response.response.text();
//   } catch (error) {
//     console.error("Error generating commit summary:", error);
//     throw new Error("Failed to generate commit summary");
//   }
// };
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Document } from "@langchain/core/documents";

if (!process.env.GOOGLE_API_KEY) {
  throw new Error("GOOGLE_API_KEY environment variable is not set");
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const aisummariseCommit = async (diff: string) => {
  try {
    const response = await model.generateContent([
      `You are an expert programmer, and you are trying to summarize a git diff.
        Reminders about the git diff format:
        For every file, there are a few metadata lines, like (for example):
        \`\`\`
        diff -- git a/lib/index.js b/lib/index.js
        index aadf691 .. bfef603 100644
        --- a/lib/index.js
        +++ b/lib/index.js
        \`\`\`
        This means that \'lib/index.js\' was modified in this commit. Note that this is only an example.
        Then there is a specifier of the lines that were modified.
        A line starting with \'+\' means it was added.
        A line that starting with \'-\' means that line was deleted.
        A line that starts with neither \'+\' nor \'-\' is code given for context and better understanding.
        It is not part of the diff.
        [ ... ]
        EXAMPLE SUMMARY COMMENTS:
        \`\`\`
        . Raised the amount of returned recordings from \'10\ to \'100\' [packages/server/recordings_api.ts], [packages/server/constants.ts]
        . Fixed a typo in the github action name [.github/workflows/gpt-commit-summarizer.yml]
        . Moved the \'octokit\ initialization to a separate file [src/ootokit.ts], [src/index.ts]
        . Added an OpenAI API for completions [packages/utils/apis/openai.ts]
        . Lowered numeric tolerance for test files
        Most commits will have less comments than this examples list.
        The last comment does not include the file names,
        because there were more than two relevant files in the hypothetical commit.
        Do not include parts of the example in your summary.
        It is given only as an example of appropriate comments. `,
      `Please summarise the following diff file: \n\n${diff}`,
    ]);
    //     const response = await model.generateContent([
    //       `You are an expert programmer. Your task is to summarize the following git diff in 1–3 bullet points.

    // Instructions:
    // - Start each line with "* "
    // - Use present tense (e.g., Fix, Add, Update, Remove, Refactor)
    // - Keep each line concise and clear (ideally under 120 characters)
    // - Mention affected file(s) in [square brackets] when possible
    // - Only summarize real changes — ignore metadata or unchanged lines
    // - Do NOT copy any part of the diff or example summaries below

    // Example summaries:
    // \`\`\`
    // * Fix login bug caused by missing token check [src/auth.ts]
    // * Refactor image upload logic for simplicity [utils/media.ts]
    // * Update readme with proper setup instructions [README.md]
    // \`\`\`

    // Now summarize the following diff:
    // \`\`\`diff
    // ${diff}
    // \`\`\`
    // `,
    //     ]);
    return response.response.text();
  } catch (error) {
    console.error("Error generating commit summary:", error);
    throw new Error("Failed to generate commit summary");
  }
};

// console.log(
//   await aisummariseCommit(`diff --git a/README.md b/README.md
// index f768e33..a46d4fa 100644
// --- a/README.md
// +++ b/README.md
// @@ -1,8 +1,23 @@
// -# React + Vite
// +Split Bill App 💳

// -This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
// +A React-based application to manage and split expenses with your friends. This app allows users to add friends, track balances, and evenly distribute expenses with ease.

// -Currently, two official plugins are available:
// +Features 🚀

// -- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
// -- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh
// +---> Add Friends: Add friends with their name and avatar.
// +
// +---> View Balances: Keep track of how much you owe or are owed by each friend.
// +
// +---> Split Bills: Distribute expenses between you and your selected friend.
// +
// +---> Dynamic Selection: Select or deselect friends for splitting bills.
// +
// +Usage 📝
// +
// +1. Add Friends: Use the "Add Friend" button to input a friend's name and avatar URL.
// +
// +2. View Balances: See who owes whom and by how much in the friends list.
// +
// +3. Split Bills: Select a friend, enter the bill details, and split the expense accordingly.
// +
// +4. Close Selection: Deselect friends to clear the split bill form.`),
// );

export const summariseCode = async (doc: Document) => {
  console.log("getting summary for", doc.metadata.source);

  try {
    const code = doc.pageContent.slice(0, 10000);
    const response = await model.generateContent([
      `You are an intelligent senior software engineer who specialises in onboarding junior software engineers onto projects`,
      `You are onboarding a junior software engineer and explaining to them the purpose of the ${doc.metadata.source} file
            Here is the code:
            ---
            ${code}
            ---
            Give a summary no more than 100 words of the code above`,
    ]);
    return response.response.text();
  } catch (error) {
    return "";
  }
};
export async function generateEmbedding(summary: string) {
  const model = genAI.getGenerativeModel({
    model: "text-embedding-004",
  });
  const result = await model.embedContent(summary);
  const embedding = result.embedding;
  return embedding.values;
}

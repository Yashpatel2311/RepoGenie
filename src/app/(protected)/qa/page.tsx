"use client";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import AskQuestionCard from "../dashboard/ask-question-card";
import MDEditor, { code } from "@uiw/react-md-editor";
import CodeReference from "../dashboard/code-references";

const QAPage = () => {
  const { projectId } = useProject();
  const { data: questions } = (api.project as any).getQuestions.useQuery({
    projectId,
  });
  const [questionIndex, setQuestionindex] = React.useState(0);
  const question = questions?.[questionIndex];

  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className="ml-4 text-xl font-semibold">Saved Question</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question: any, index: any) => {
          return (
            <React.Fragment key={question.id}>
              <SheetTrigger
                onClick={() => {
                  setQuestionindex(index);
                }}
              >
                <div className="flex items-center rounded-lg border bg-white p-4 shadow">
                  <img
                    className="mr-2 rounded-full"
                    height={30}
                    width={30}
                    src={question.user.imageUrl ?? ""}
                  />
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-2">
                      <p className="line-clamp-1 text-lg font-medium text-gray-700">
                        {question.question}
                      </p>
                      <span className="text-xs whitespace-nowrap text-gray-400">
                        {question.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm text-gray-500">
                      {question.answer}
                    </p>
                  </div>
                </div>
              </SheetTrigger>
            </React.Fragment>
          );
        })}
      </div>
      {question && (
        <SheetContent className="sm:max-w-[80vw]">
          <SheetHeader>
            <SheetTitle>{question.question}</SheetTitle>
            <div
              className="max-h-[49vh] max-w-full overflow-auto rounded-lg bg-white p-4 text-black"
              style={{ minWidth: "300px" }}
            >
              <MDEditor.Markdown
                source={question.answer}
                className="prose prose-sm max-w-none"
                style={{
                  background: "transparent",
                  padding: 0,
                  color: "black",
                }}
                components={{
                  code({ node, className, children, ...props }) {
                    // 'inline' is not a valid prop, so infer inline code by checking for a className
                    const isInline = !className;
                    return !isInline ? (
                      <pre
                        className="overflow-auto rounded-md bg-gray-900 p-3 py-5 leading-relaxed text-white"
                        style={{ margin: 0 }}
                      >
                        <code className={className}>{children}</code>
                      </pre>
                    ) : (
                      <code
                        className="rounded bg-gray-200 px-1 text-pink-700"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              />
            </div>
            <CodeReference
              filesReferences={(question.fileReferences ?? []) as any}
            />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  );
};

export default QAPage;

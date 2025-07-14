import { api } from "@/trpc/react";
import React from "react";
import { useLocalStorage } from "usehooks-ts";

const useProject = () => {
  const [projectId, setProjectId] = useLocalStorage("projectId", "");
  const { data: projects } = (api.project as any).getProjects.useQuery();
  const project = projects?.find((project: any) => project.id === projectId);

  return {
    projects,
    project,
    projectId,
    setProjectId,
  };
};

export default useProject;

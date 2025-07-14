"use client";
import { SidebarProvider } from "@/components/ui/sidebar";
// import { SidebarProvider } from "../components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React, { useRef } from "react";
import { AppSidebar } from "./app-sidebar";
import { Input } from "@/components/ui/input";
import useProject from "@/hooks/use-project";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children: React.ReactNode;
};
const SidebarLayout = ({ children }: Props) => {
  const { projects, setProjectId } = useProject();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const filteredProjects =
    search.length > 0
      ? projects?.filter((p: any) =>
          p.name.toLowerCase().includes(search.toLowerCase()),
        )
      : [];
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle Enter key for redirect
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && search.trim() !== "") {
      setShowDropdown(false);
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar relative flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          {/* Search Bar - flex-grow to fill space */}
          <div className="relative mr-4 max-w-full flex-grow">
            <Input
              ref={inputRef}
              type="text"
              placeholder="Search for projects..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
              onKeyDown={handleKeyDown}
              className="w-full pl-8"
            />
            <span className="absolute top-1/2 left-2 -translate-y-1/2 text-gray-400">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
                <path
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 1 0 6.5 6.5a7.5 7.5 0 0 0 10.6 10.6Z"
                />
              </svg>
            </span>
            {showDropdown && filteredProjects.length > 0 && (
              <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white shadow-lg">
                {filteredProjects.map((project: any) => (
                  <div
                    key={project.id}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onMouseDown={() => {
                      setProjectId(project.id);
                      setSearch("");
                      setShowDropdown(false);
                    }}
                  >
                    {project.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        {/* main content */}
        <div className="border-sidebar-border bg-sidebar h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;

"use client";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useRefetch from "@/hooks/use-refetch";
import { toast } from "sonner";

const MeetingPage = () => {
  const { project } = useProject();
  const { data: meetings, isLoading } = (
    api.project as any
  ).getMeetings.useQuery(
    { projectId: project?.id ?? "" },
    {
      refetchInterval: 4000, // Refetch every 4 seconds
    },
  );
  const deleteMeeting = (api.project as any).deleteMeeting.useMutation();
  const refetch = useRefetch();

  return (
    <>
      <MeetingCard />
      <div className="h-6"></div>
      <h1 className="ml-4 text-xl font-semibold">Meetings</h1>
      <div className="h-2"></div>
      {meetings && meetings.length === 0 && (
        <div className="ml-4 text-sm text-gray-500">No meetings found</div>
      )}
      {isLoading && (
        <div className="ml-4 text-sm text-gray-500">Loading...</div>
      )}
      <ul className="ml-4 divide-y divide-gray-200">
        {meetings?.map((meeting: any) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-4 py-5"
          >
            <div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/meetings/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <Badge className="bg-blue-500 text-white">
                      Processing...
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-x-2 text-sm text-gray-500">
                <p className="whitespace-nowrap">
                  {new Date(meeting.createdAt).toLocaleDateString()}
                </p>
                <p className="truncate">{meeting.issues.length} issues</p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button size="sm" variant="outline">
                  View Meeting
                </Button>
              </Link>
              <Button
                size="sm"
                disabled={deleteMeeting.isPending}
                variant="destructive"
                onClick={() => {
                  console.log("Deleting meeting with id:", meeting.id);
                  if (meeting.id) {
                    deleteMeeting.mutate(
                      { meetingId: meeting.id },
                      {
                        onSuccess: () => {
                          toast.success("Meeting deleted successfully");
                          refetch();
                        },
                      },
                    );
                  } else {
                    toast.error("Meeting ID is missing!");
                  }
                }}
              >
                Delete Meeting
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MeetingPage;

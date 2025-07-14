"use client";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Card } from "@/components/ui/card";
import { useDropzone } from "react-dropzone";
import React from "react";
import { uploadFile } from "@/lib/cloudinary";
import { Presentation, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import useProject from "@/hooks/use-project";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

const MeetingCard = () => {
  const { project } = useProject();
  const [isUploading, setIsUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const router = useRouter();
  const uploadMeeting = (api.project as any).uploadMeeting.useMutation();

  // MEETING AUDIO PROCESSING FUNCTION USING ASSEMBLY-AI
  const processMeeting = useMutation({
    mutationFn: async (data: {
      meetingUrl: string;
      meetingId: string;
      projectId: string;
    }) => {
      const { meetingUrl, meetingId, projectId } = data;
      // hitting the /api/process-meeting endpoint to process the meeting
      const response = await axios.post("/api/process-meeting", {
        meetingUrl,
        meetingId,
        projectId,
      });
      return response.data;
    },
  });

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "audio/*": [".mp3", ".wav", ".m4a"],
    },
    multiple: false,
    maxSize: 50_000_000,
    onDrop: async (acceptedFiles) => {
      if (!project) return;
      setIsUploading(true);
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (!file) return;
      // Here you can handle the file upload, e.g., using Firebase storage
      const downloadURL = await uploadFile(file as File, setProgress);
      console.log("Cloudinary upload URL:", downloadURL);
      uploadMeeting.mutate(
        {
          projectId: project.id,
          meetingUrl: downloadURL as string,
          name: file.name,
        },
        {
          onSuccess: (meeting: { id: any }) => {
            toast.success("Meeting uploaded successfully!");
            router.push("/meetings");
            // after successfull-upload, now callng the processMeeting mutation
            processMeeting.mutateAsync({
              meetingUrl: downloadURL as string,
              meetingId: meeting.id,
              projectId: project.id,
            });
          },
          onError: () => {
            toast.error("Failed to upload meeting!");
          },
        },
      );
      setIsUploading(false);
    },
  });

  return (
    <Card
      className="col-span-2 flex max-h-[35vh] flex-col items-center justify-center p-4"
      {...getRootProps()}
    >
      {!isUploading && (
        <>
          <Presentation className="h-10 w-10 animate-bounce" />
          <h3 className="text-sm font-semibold text-gray-900">
            Create a new meeting
          </h3>
          <p className="mt-1 text-center text-xs text-gray-500">
            Analyse your meeting with RepoGenie
            <br />
            Powered by AI
          </p>
          <div className="mt-2">
            <Button disabled={isUploading}>
              <Upload className="mr-1.5 -ml-0.5 h-5 w-5" aria-hidden="true" />
              Upload Meeting
              <input className="hidden" {...getInputProps()} />
            </Button>
          </div>
        </>
      )}
      {isUploading && (
        <div>
          <CircularProgressbar
            value={progress}
            text={`${progress}%`}
            className="size-20"
            styles={buildStyles({
              pathColor: "#000",
              textColor: "#000",
            })}
          />
          <p className="text-center text-sm text-gray-500">
            Uploading your meeting...
          </p>
        </div>
      )}
    </Card>
  );
};
export default MeetingCard;

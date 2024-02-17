import { JobTagType } from "@/utils/constants";

export interface JobData {
  id?: string;
  title: string;
  description: string;
  salary: number[];
  tags: JobTagType[];
  postedBy: {
    name: string;
  };
  status: string;
  metadata?: {
    createdAt: number;
    updatedAt: number;
    updatedBy?: string;
  }
}
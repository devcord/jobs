import { JobTagType } from "@/utils/constants";

export interface JobData {
  id?: string;
  title: string;
  description: string;
  salary: number[];
  tags: JobTagType[];
  postedBy: {
    name: string;
    id: string;
  };
  status: string;
  metadata?: {
    createdAt: number;
    updatedAt: number;
    updatedBy?: string;
  }
}

export interface ForHireData {
  id?: string;
  description: string;
  salary: number[];
  tags: JobTagType[];
  postedBy: {
    name: string;
    id: string;
  };
  status: string;
  metadata?: {
    createdAt: number;
    updatedAt: number;
    updatedBy?: string;
  }
}
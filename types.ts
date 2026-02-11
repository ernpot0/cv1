
export enum UserRole {
  JOB_SEEKER = 'JOB_SEEKER',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN'
}

export enum CVVisibility {
  PRIVATE = 'PRIVATE',
  EMPLOYERS_ONLY = 'EMPLOYERS_ONLY',
  PUBLIC = 'PUBLIC'
}

export enum JobPostStatus {
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  DRAFT = 'DRAFT'
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  location?: string;
  description: string;
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  year: string;
}

export interface Course {
  id: string;
  title: string;
  institution: string;
  year: string;
}

export interface Reference {
  id: string;
  name: string;
  position: string;
  email: string;
  phone: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  password?: string;
  avatar?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: number;
  read: boolean;
}

export interface SavedCandidate {
  id: string;
  employerId: string;
  cvId: string;
  timestamp: number;
}

export interface JobPost {
  id: string;
  employerId: string;
  companyName: string;
  title: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  salaryRange: string;
  description: string;
  requirements: string[];
  benefits: string[];
  status: JobPostStatus;
  updatedAt: number;
  themeColor: string;
}

export interface CV {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  city?: string;
  state?: string;
  country?: string;
  summary: string;
  jobTitle: string;
  experiences: Experience[];
  educations: Education[];
  courses: Course[];
  languages: string[];
  skills: string[];
  references: Reference[];
  visibility: CVVisibility;
  updatedAt: number;
  themeColor: string;
  photoUrl?: string;
  template?: 'modern' | 'canadian' | 'minimalist';
}

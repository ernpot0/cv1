
import { User, CV, UserRole, CVVisibility, Message, SavedCandidate, JobPost } from '../types';

const USERS_KEY = 'procv_users_v2';
const CVS_KEY = 'procv_cvs_v2';
const MESSAGES_KEY = 'procv_messages_v2';
const SAVED_KEY = 'procv_saved_v2';
const JOBS_KEY = 'procv_jobs_v2';

const INITIAL_USERS: User[] = [
  { id: 'u1', email: 'seeker@procv.com', fullName: 'John Seeker', role: UserRole.JOB_SEEKER, password: 'password' },
  { id: 'u2', email: 'employer@procv.com', fullName: 'Elite Recruiting', role: UserRole.EMPLOYER, password: 'password' }
];

export const db = {
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : INITIAL_USERS;
  },
  saveUsers: (users: User[]) => localStorage.setItem(USERS_KEY, JSON.stringify(users)),
  
  getCVS: (): CV[] => {
    const data = localStorage.getItem(CVS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveCVS: (cvs: CV[]) => localStorage.setItem(CVS_KEY, JSON.stringify(cvs)),

  getMessages: (): Message[] => {
    const data = localStorage.getItem(MESSAGES_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveMessages: (msgs: Message[]) => localStorage.setItem(MESSAGES_KEY, JSON.stringify(msgs)),

  getSavedCandidates: (): SavedCandidate[] => {
    const data = localStorage.getItem(SAVED_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveSavedCandidates: (items: SavedCandidate[]) => localStorage.setItem(SAVED_KEY, JSON.stringify(items)),

  getJobPosts: (): JobPost[] => {
    const data = localStorage.getItem(JOBS_KEY);
    return data ? JSON.parse(data) : [];
  },
  saveJobPosts: (jobs: JobPost[]) => localStorage.setItem(JOBS_KEY, JSON.stringify(jobs)),

  canViewCV: (cv: CV, viewer: User | null): boolean => {
    if (cv.visibility === CVVisibility.PUBLIC) return true;
    if (!viewer) return false;
    if (cv.userId === viewer.id) return true;
    if (cv.visibility === CVVisibility.EMPLOYERS_ONLY && viewer.role === UserRole.EMPLOYER) return true;
    return viewer.role === UserRole.ADMIN;
  }
};

// ממשק לחבר משפחה
export interface FamilyMember {
  id: number;
  firstName: string;
  lastName: string;
  role: string;
  birthDate: string;
  email?: string;
  phone?: string;
  hobbies: string[];
}

// ממשק למשפחה
export interface Family {
  lastName: string;
  members: FamilyMember[];
}

// ממשק למשימה
export interface Task {
  id: number;
  title: string;
  description: string;
  assignedTo: number; // member id
  createdBy?: number; // member id
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'completed';
}

// ממשק לאירוע יומן
export interface CalendarEvent {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  participants: number[]; // array of member ids
  repeat: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  category?: 'family' | 'work' | 'school' | 'holiday' | 'other';
}

// ממשק למסמך
export interface Document {
  id: number;
  title: string;
  memberId: number; // member id this document is associated with
  type: 'pdf' | 'image' | 'doc';
  url: string;
  uploadDate: string;
  uploadedBy: number; // member id
  tags: string[];
}

// סוגי התראות
export type NotificationType = 'task' | 'event' | 'document' | 'general';

// ממשק להתראה
export interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  date: string;
  read: boolean;
  relatedId?: number; // מזהה של פריט קשור (משימה, אירוע, מסמך)
}

// משתמש מחובר
export interface User {
  id: number;
  email: string;
  familyId: number;
  memberId: number;
  lastLogin?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

// פרטי התחברות
export interface LoginCredentials {
  email: string;
  password: string;
} 
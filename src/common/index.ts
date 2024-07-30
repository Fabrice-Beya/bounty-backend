export enum Role {
  USER = 'user',
  ADMIN = 'admin'
}

export enum BountyStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export enum BountyPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

export enum BountyCategory {
  SMUGGLING = 'Smuggling',
  PIRACY = 'Piracy',
  THEFT = 'Theft',
  FRAUD = 'Fraud',
  OTHER = 'Other'
}

export enum TipStatus {
  NEW = 'New',
  IN_PROGRESS = 'In Progress',
  VERIFIED = 'Verified',
  CLOSED = 'Closed',
  REJECTED = 'Rejected'
}

export enum TipCategory {
  GENERAL = 'General',
  SIGHTING = 'Sighting',
  INTELLIGENCE = 'Intelligence',
  EVIDENCE = 'Evidence',
  OTHER = 'Other'
}

export interface UserProfile {
  username: string;
  fullName: string;
  notificationEmail: string;
  enableNotification: boolean;
  bio: string;
  contactNumber: string;
}

export interface UserModel {
  id: string;
  email: string;
  role: Role;
  createdAt: string;
  lastLogin: string;
  profile: UserProfile;
}

export interface Bounty {
  id: string;
  title: string;
  description: string;
  reward: number;
  status: BountyStatus;
  createdAt: string;
  expiresAt?: string;
  createdBy: string;
  category: BountyCategory;
  priority: BountyPriority;
}

export interface Tip {
  id: string;
  title: string;
  description: string;
  category: TipCategory;
  datetime: Date;
  location: string;
  status: TipStatus;
  createdAt: Date;
  updatedAt: Date;
}


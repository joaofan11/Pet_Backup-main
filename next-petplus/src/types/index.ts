export interface User {
  userId: number;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
}

export interface AuthData {
  token: string;
  user: User;
  message?: string;
}

export interface Pet {
  id: number;
  name: string;
  species: 'dog' | 'cat';
  breed: string;
  age: 'puppy' | 'young' | 'adult' | 'senior';
  size: 'small' | 'medium' | 'large';
  gender: 'male' | 'female';
  description: string;
  type: 'adoption' | 'personal';
  status?: 'available' | 'adopted';
  photoUrl?: string;
  ownerId: number;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  vaccines: Vaccine[];
  createdAt: string;
}

export interface Vaccine {
  id: number;
  name: string;
  date: string;
  nextDate?: string | null;
  vet?: string | null;
  notes?: string | null;
}

export interface ServiceProvider {
  id: number;
  category: 'vet' | 'sitter' | 'walker' | 'transport';
  name: string;
  professional: string;
  phone: string;
  address: string;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  ownerId: number;
}

export interface BlogPost {
  id: number;
  content: string;
  photoUrl?: string;
  location?: string;
  ownerId: number;
  ownerName: string;
  authorPhoto?: string;
  likes: number[];
  comments: BlogComment[];
  createdAt: string;
}

export interface BlogComment {
  id: number;
  content: string;
  ownerName: string;
  createdAt: string;
}

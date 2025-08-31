export type AlertStatus = 'validating' | 'generating' | 'formatting' | 'ready';

export interface AlertContent {
  title: string;
  body: string;
  status?: AlertStatus;
}


export interface EmergencyContact {
  id: string;
  name: string;
  contact: string;
  type: 'phone' | 'email';
  priority: 'high' | 'medium' | 'low';
  groups: string[];
  notes?: string;
}

export interface ContactGroup {
  id: string;
  name: string;
  description?: string;
  color?: string;
}

export interface EmergencyList {
  id: string;
  name: string;
  description?: string;
  contacts: string[]; // Array of EmergencyContact IDs
  groups?: string[]; // Array of ContactGroup IDs
}
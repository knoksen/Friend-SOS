export type AlertStatus = 'validating' | 'generating' | 'formatting' | 'ready';

export interface AlertContent {
  title: string;
  body: string;
  status?: AlertStatus;
}

export interface MessageTemplate {
  id: string;
  title: string;
  message: string;
}
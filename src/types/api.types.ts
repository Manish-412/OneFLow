export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    approvalStatus: ApprovalStatus;
  };
}

export interface SignupResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    approvalStatus: ApprovalStatus;
  };
}

export interface ApprovalCheckResponse {
  status: ApprovalStatus;
}
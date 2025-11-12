export interface IQuiz {
  id: string;
  name: string;
  meta: {
    type: "evaluative" | "feedback";
    max_attempts: number;
  };
  acceptingResponses: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuestion {
  id: string;
  quizId: string;
  questionText: string;
  options: IQuestionOption[];
  answerType: "mcq" | "scale";
  meta: any;
  order: number;
}

export interface IQuestionOption {
  option_key: string;
  label: string;
  value: number;
}

export interface IQuizSubmission {
  id: string;
  userId: string;
  quizId: string;
  responses: IQuizResponse[];
  score: number | null;
  submittedAt: Date | null;
  validated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IQuizResponse {
  question_id: string;
  selected_option_key: string;
  answer: string;
}

export interface IQuizInference {
  id: string;
  quizId: string;
  inferenceLogic: {
    type: "minmax";
    rules: IInferenceRule[];
  };
}

export interface IInferenceRule {
  min: number;
  max: number;
  inference: string;
}

export interface IGroup {
  id: string;
  name: string;
  description: string | null;
  createdBy: string;
  createdAt: Date;
}

export interface IGroupUser {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  joinedAt: Date;
}

export interface IQuizGroupPermission {
  id: string;
  quizId: string;
  groupId: string;
  permission: "attempt" | "view" | "edit";
}

// Response DTOs
export interface IQuizListResponse {
  id: string;
  name: string;
  type: "evaluative" | "feedback";
  acceptingResponses: boolean;
  hasAccess: boolean;
  attemptStatus: {
    attempted: boolean;
    attemptCount: number;
    maxAttempts: number;
    canAttempt: boolean;
    hasInProgressAttempt: boolean;
  };
}

export interface IQuizDetailResponse {
  id: string;
  name: string;
  type: "evaluative" | "feedback";
  acceptingResponses: boolean;
  maxAttempts: number;
  questions?: IQuestion[]; // Only if accepting responses
  attemptStatus: {
    attempted: boolean;
    attemptCount: number;
    canAttempt: boolean;
    hasInProgressAttempt: boolean;
    inProgressSubmissionId?: string;
  };
}

export interface IQuizResultResponse {
  quizId: string;
  quizName: string;
  quizType: "evaluative" | "feedback";
  score: number | null;
  totalQuestions: number;
  responses: IQuizResponse[];
  inference: string | null;
  submittedAt: Date;
}

export interface ISaveDraftRequest {
  responses: IQuizResponse[];
}

export interface ISubmitQuizRequest {
  responses: IQuizResponse[];
}

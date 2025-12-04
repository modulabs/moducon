export interface Question {
  id: string;
  content: string;
  isAnonymous: boolean;
  author: {
    id: string | null;
    name: string;
  };
  likeCount: number;
  isLiked: boolean;
  isAnswered: boolean;
  isPinned: boolean;
  isOwner: boolean;
  answer: {
    content: string;
    answeredBy: string | null;
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface QuestionsResponse {
  success: boolean;
  data: {
    questions: Question[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export type TargetType = 'session' | 'booth' | 'paper';

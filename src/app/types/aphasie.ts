export type AphasieItem = {
  id: number;
  quote: string;
  meaning: string;
  date: string | null;
  comment: string | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

export type AphasieChallenge = {
  id: number;
  text: string;
  mastered: boolean;
  userId: number;
  createdAt: string;
  updatedAt: string;
};

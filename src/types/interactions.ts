export interface InteractionSummary {
  essaySlug: string;
  isRead: boolean;
  isFavorite: boolean;
  isOnReadingList: boolean;
}

export interface InteractionDetail extends InteractionSummary {
  note: string;
}

export type InteractionField = 'isFavorite' | 'isOnReadingList' | 'isRead';

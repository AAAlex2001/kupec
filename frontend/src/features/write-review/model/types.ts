/** Объявление, о котором пишут отзыв: для шапки формы. */
export type ReviewTarget = {
  listingId: number;
  title: string;
  coverUrl: string | null;
  subtitle: string;
};

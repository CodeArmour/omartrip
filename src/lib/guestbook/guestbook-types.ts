export type GuestbookMessageStatus = "visible" | "hidden" | "pending";

export type GuestbookPublicUser = {
  id: string;
  displayName: string;
  avatarUrl?: string;
};

export type GuestbookMessage = {
  id: string;
  userId: string;
  content: string;
  status: GuestbookMessageStatus;
  createdAt: Date;
  updatedAt: Date;
  user: GuestbookPublicUser;
};

export type GuestbookCreateInput = {
  content: string;
  idempotencyKey: string;
};

export type GuestbookMutationResult =
  | { status: "saved"; message: GuestbookMessage }
  | {
      status:
        | "unauthenticated"
        | "forbidden"
        | "invalid"
        | "rate-limited"
        | "duplicate"
        | "configuration-unavailable";
      message: string;
    };

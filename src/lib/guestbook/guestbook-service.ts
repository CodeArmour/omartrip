import type {
  GuestbookCreateInput,
  GuestbookMessage,
  GuestbookMutationResult,
} from "./guestbook-types";

export interface GuestbookService {
  listVisibleMessages(): Promise<GuestbookMessage[]>;
  createMessage(
    userId: string,
    input: GuestbookCreateInput,
  ): Promise<GuestbookMutationResult>;
  updateMessage(
    userId: string,
    messageId: string,
    content: string,
  ): Promise<GuestbookMutationResult>;
  deleteMessage(
    userId: string,
    messageId: string,
  ): Promise<GuestbookMutationResult>;
}

const unavailableResult = {
  status: "configuration-unavailable" as const,
  message: "Guestbook posting is not configured yet.",
};

export const unavailableGuestbookService: GuestbookService = {
  async listVisibleMessages() {
    return [];
  },
  async createMessage() {
    return unavailableResult;
  },
  async updateMessage() {
    return unavailableResult;
  },
  async deleteMessage() {
    return unavailableResult;
  },
};

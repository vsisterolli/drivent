import { ApplicationError } from "@/protocols";

export function invalidTicketType(): ApplicationError {
  return {
    name: "invalidTicketType",
    message: "Ticket must be paid or must include a hotel",
  };
}

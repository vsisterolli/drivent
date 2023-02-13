import { ApplicationError } from "@/protocols";

export function invalidBooking(): ApplicationError {
  return {
    name: "invalidTicketType",
    message: "User doesn't own this booking",
  };
}

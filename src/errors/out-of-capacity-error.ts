import { ApplicationError } from "@/protocols";

export function outOfCapacity(): ApplicationError {
  return {
    name: "outOfCapacity",
    message: "Selected room is out of capacity",
  };
}

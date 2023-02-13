import { Router } from "express";
import { authenticateToken, validateBody } from "@/middlewares";
import { changeRoom, getUsersBookings, insertBooking } from "@/controllers/bookings-controller";
import { bookingReqSchema } from "@/schemas/booking-schemas";

const bookingsRouter = Router();

bookingsRouter
  .all("/*", authenticateToken)
  .get("/", getUsersBookings)
  .post("/", validateBody(bookingReqSchema), insertBooking)
  .put('/:bookingId', validateBody(bookingReqSchema), changeRoom)
 
export { bookingsRouter };

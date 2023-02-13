import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import bookingServices from "@/services/bookings-service";
import httpStatus from "http-status";

export async function getUsersBookings(req: AuthenticatedRequest, res: Response) {
    try {
        const bookings = await bookingServices.checkUserBookings(req.userId);
        return res.send(bookings);
    } catch(e) {
        return res.sendStatus(httpStatus.NOT_FOUND);
    }
}

export async function insertBooking(req: AuthenticatedRequest, res: Response) {
    try {
        await bookingServices.checkBookingInsertion(req.userId, req.body.roomId);
        const booking = await bookingServices.createBooking(req.userId, req.body.roomId);
        return res.send({bookingId: booking.id});
    }
    catch(error) {
        if(error.name === "NotFoundError")
            return res.sendStatus(httpStatus.NOT_FOUND);
        else
            return res.sendStatus(httpStatus.FORBIDDEN);
    }
}

export async function changeRoom(req: AuthenticatedRequest, res: Response) {
    try {
        const newRoomId: number = req.body.roomId;
        const bookingId: number = Number(req.params.bookingId);
        await bookingServices.verifyChange(req.userId, bookingId, newRoomId);
        return res.send({bookingId: bookingId});
    }
    catch(error) {
        if(error.name === "NotFoundError")
            return res.sendStatus(httpStatus.NOT_FOUND);
        else
            return res.sendStatus(httpStatus.FORBIDDEN);
    }
}
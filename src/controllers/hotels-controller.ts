import { AuthenticatedRequest } from "@/middlewares";
import hotelRepository from "@/repositories/hotel-repository";
import hotelsServices from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
    try {
        await hotelsServices.validateTicketHotelRelation(req.userId);
        
        const hotels = await hotelRepository.listHotels();
        return res.send(hotels)
    } catch(error) {
        if(error.name === "NotFoundError")
            return res.sendStatus(httpStatus.NOT_FOUND);
        else
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
}

export async function getRooms(req: AuthenticatedRequest, res: Response) {
    try {
        await hotelsServices.validateTicketHotelRelation(req.userId);
        
        const hotelId: number = Number(req.params.id);
        const hotelWithRooms = await hotelsServices.validateHotelWithRooms(hotelId);
        return res.send(hotelWithRooms)
    } catch(error) {
        if(error.name === "NotFoundError")
            return res.sendStatus(httpStatus.NOT_FOUND);
        else
            return res.sendStatus(httpStatus.PAYMENT_REQUIRED);
    }
}

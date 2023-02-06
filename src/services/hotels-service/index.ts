import { invalidTicketType, notFoundError } from "@/errors";
import hotelRepository from "@/repositories/hotel-repository";
import { TicketStatus } from "@prisma/client";
import ticketService from "../tickets-service";

async function validateTicketHotelRelation(userId: number) {
    const ticket = await ticketService.getTicketByUserId(userId);
    if(!ticket.TicketType.includesHotel || ticket.TicketType.isRemote || ticket.status !== TicketStatus.PAID)
        throw invalidTicketType();
}

async function validateHotelWithRooms(hotelId: number) {
    const hotel = await hotelRepository.getHotelWithRooms(hotelId);
    if(!hotel)
        throw notFoundError();
    return hotel;
}

const hotelsServices = {
    validateTicketHotelRelation,
    validateHotelWithRooms
}

export default hotelsServices;
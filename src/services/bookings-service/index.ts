import { invalidTicketType, notFoundError, outOfCapacity } from "@/errors";
import { invalidBooking } from "@/errors/invalid-booking-error";
import bookingRepositories from "@/repositories/booking-repository";
import roomRepository from "@/repositories/room-repository";
import ticketRepository from "@/repositories/ticket-repository";
import { TicketStatus } from "@prisma/client";
import enrollmentsService from "../enrollments-service";

async function checkUserBookings(userId: number) {
    const bookings = await bookingRepositories.getUsersBookingsById(userId);
    if(!bookings)
        throw notFoundError();
    return bookings;
}

async function checkBookingInsertion(userId: number, roomId: number) {
    
    const enrollment = await enrollmentsService.getOneWithAddressByUserId(userId)
    const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
    if(!ticket)
        throw invalidTicketType();

    const type = await ticketRepository.findTicketType(ticket.id);
    
    if(type.TicketType.isRemote || !type.TicketType.includesHotel || 
       ticket.status !== TicketStatus.PAID)
       throw invalidTicketType();
    
    const room = await roomRepository.findRoom(roomId);
    if(!room)
        throw notFoundError();
    
    if(!room.capacity)
        throw outOfCapacity();

}

async function createBooking(userId: number, roomId: number) {
    const booking = await bookingRepositories.createBooking(userId, roomId);
    await roomRepository.occupyRoom(roomId);
    return booking;
}

async function verifyChange(userId: number, bookingId: number, newRoomId: number) {
    const booking = await bookingRepositories.findBookingById(bookingId);
    if(!booking)
        throw invalidBooking();

    if(booking.userId !== userId)
        throw invalidBooking();
    
    const newRoom = await roomRepository.findRoom(newRoomId);
    if(!newRoom)
        throw notFoundError();
    if(!newRoom.capacity)
        throw outOfCapacity();
    
    await roomRepository.freeRoom(booking.roomId);
    await roomRepository.occupyRoom(newRoomId);
    await bookingRepositories.updateRoom(bookingId, newRoomId);

}

const bookingServices = {
    checkUserBookings,
    checkBookingInsertion,
    createBooking,
    verifyChange
}

export default bookingServices;
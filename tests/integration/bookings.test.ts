import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import faker from "@faker-js/faker";
import { createUser, createEnrollmentWithAddress, createTicketType, createTicket, createRemoteTicketType, createTicketTypeWithoutHotel, createValidTicketType } from "../factories";
import { generateValidToken, cleanDb } from "../helpers";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { createHotel, createZeroCapacityHotel } from "../factories/hotels-factory";
import { prisma } from "@/config";
import { createBooking } from "../factories/booking-factory";


beforeAll(async () => {
    await init();
});
  
beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("POST /booking", () => {
    it("should create booking and ocuppy room when req is valid",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createValidTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const response = 
        await server.post('/booking')
        .send({roomId: hotel.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}})
        const bookingCount = await prisma.booking.count();

        expect(room.capacity).toBe(9);
        expect(bookingCount).toBe(1);
        expect(response.body).toEqual(
            expect.objectContaining({
                bookingId: expect.any(Number)
            })
        );
        expect(response.status).toBe(200);
    })

    it("should respond with bad request when there is no roomId in body",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const response = 
        await server.post('/booking')
        .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    })

    it("should respond with 403 FORBIDDEN when room is full",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createValidTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createZeroCapacityHotel();
        const response = 
        await server.post('/booking')
        .send({roomId: hotel.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}})
        const bookingCount = await prisma.booking.count();

        expect(room.capacity).toBe(0);
        expect(bookingCount).toBe(0);
        expect(response.status).toBe(403);
    })
    it("should respond with 403 FORBIDDEN if there is no ticket",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const hotel = await createHotel();
        const response = 
        await server.post('/booking')
        .send({roomId: hotel.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}})

        expect(room.capacity).toBe(10);
        expect(response.status).toBe(403);
    })
    it("should respond with 403 FORBIDDEN if ticket it's not paid",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createValidTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const hotel = await createHotel();
        const response = 
        await server.post('/booking')
        .send({roomId: hotel.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}})

        expect(room.capacity).toBe(10);
        expect(response.status).toBe(403);
    })
    it("should respond with 403 FORBIDDEN if ticket it's remote",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createRemoteTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const response = 
        await server.post('/booking')
        .send({roomId: hotel.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}})

        expect(room.capacity).toBe(10);
        expect(response.status).toBe(403);
    })
    it("should respond with 403 FORBIDDEN if ticket doesn't include hotel",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const response = 
        await server.post('/booking')
        .send({roomId: hotel.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}})

        expect(room.capacity).toBe(10);
        expect(response.status).toBe(403);
    })
    it("should respond with 404 NOT FOUND when roomId is invalid",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const response = 
        await server.post('/booking')
        .send({roomId: 0})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}})

        expect(room.capacity).toBe(10);
        expect(response.status).toBe(403);
    })
})

describe("GET /booking",  () => {
    it("should respond with 200 and return bookingId and room when request is valid", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const booking = await createBooking(user.id, hotel.Rooms[0].id);
        const response = await server.get('/booking').set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(
            expect.objectContaining({
                id: expect.any(Number),
                Room: expect.any(Object)
            })
        )
    })
    it("should respond with 404 when user has no booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const response = await server.get('/booking').set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.NOT_FOUND);
    })
})

describe("PUT /booking/:bookingId",  () => {
    it("should respond with 200 and return bookingId when request is valid and change rooms", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const hotel2 = await createHotel();
        const booking = await createBooking(user.id, hotel.Rooms[0].id);
        const response = 
        await server.put('/booking/' + booking.id)
        .send({roomId: hotel2.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);

        const room = await prisma.room.findUnique({where: {id: hotel.Rooms[0].id}});
        const room2 = await prisma.room.findUnique({where: {id: hotel2.Rooms[0].id}});
        const changedBooking = await prisma.booking.findUnique({where: {id: booking.id}});

        expect(changedBooking.roomId).toBe(hotel2.Rooms[0].id)
        expect(room.capacity).toBe(10);
        expect(room2.capacity).toBe(9);
        expect(response.status).toBe(httpStatus.OK);
        expect(response.body).toEqual(
            expect.objectContaining({
                bookingId: expect.any(Number),
            })
        )
    })
    it("should respond with 403 when there is no booking", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const hotel2 = await createHotel();
        const response = 
        await server.put('/booking/0')
        .send({roomId: hotel2.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);
    })
    it("should respond with 403 when newRoom is out of capacity", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const hotel2 = await createZeroCapacityHotel();
        const booking = await createBooking(user.id, hotel.Rooms[0].id);
        const response = 
        await server.put('/booking/' + booking.id)
        .send({roomId: hotel2.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);
    })
    it("should respond with 404 when newRoom doesn't exist", async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const booking = await createBooking(user.id, hotel.Rooms[0].id);
        const response = 
        await server.put('/booking/' + booking.id)
        .send({roomId: 0})
        .set("Authorization", `Bearer ${token}`);
    })

    it("should respond with 403 when user doesnt own booking", async () => {
        const user = await createUser();
        const user2 = await createUser();
        const token = await generateValidToken(user2);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithoutHotel();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        const hotel = await createHotel();
        const hotel2 = await createHotel();
        const booking = await createBooking(user.id, hotel.Rooms[0].id);
        const response = 
        await server.put('/booking/' + booking.id)
        .send({roomId: hotel2.Rooms[0].id})
        .set("Authorization", `Bearer ${token}`);
        
        expect(response.status).toBe(httpStatus.FORBIDDEN);
    })

    it("should respond with bad request when there is no roomId in body",async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const response = 
        await server.put('/booking/1')
        .set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.BAD_REQUEST);
    })

})
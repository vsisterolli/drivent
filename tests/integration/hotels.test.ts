import app, { init } from "@/app";
import httpStatus from "http-status";
import supertest from "supertest";
import faker from "@faker-js/faker";
import { createUser, createEnrollmentWithAddress, createTicketType, createTicket, createRemoteTicketType, createTicketTypeWithoutHotel, createValidTicketType } from "../factories";
import { generateValidToken, cleanDb } from "../helpers";
import * as jwt from "jsonwebtoken";
import { TicketStatus } from "@prisma/client";
import { createHotel } from "../factories/hotels-factory";


beforeAll(async () => {
    await init();
});
  
beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
   
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels");
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 when user has no tickets", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);      
            const response = await server.get('/hotels').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
        })
        it("should respond with status 402 if ticket hasn't been paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            
            const response = await server.get('/hotels').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it("should respond with status 402 if ticketType is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createRemoteTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
            const response = await server.get('/hotels').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it("should respond with status 402 if ticketType doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithoutHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
            const response = await server.get('/hotels').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        
        describe("when ticket is valid", () => {
            it("should respond with status 200 and the hotel listing", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createValidTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotel();

                const response = await server.get('/hotels').set("Authorization", `Bearer ${token}`);
                expect(response.statusCode).toBe(httpStatus.OK);
                expect(response.body).toEqual(
                    expect.arrayContaining([
                        expect.objectContaining({
                            id: expect.any(Number),
                            name: expect.any(String),
                            image: expect.any(String),
                            createdAt: expect.any(String),
                            updatedAt: expect.any(String)
                        })
                    ])
                )
            })
        })

    })

})

describe("GET /hotels/id", () => {
   
    it("should respond with status 401 if no token is given", async () => {
        const response = await server.get("/hotels/1");
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it("should respond with status 401 if given token is not valid", async () => {
        const token = faker.lorem.word();
        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
    
    it("should respond with status 401 if there is no session for given token", async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
        const response = await server.get("/hotels/1").set("Authorization", `Bearer ${token}`);
        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe("when token is valid", () => {
        it("should respond with status 404 when user has no tickets", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);      
            const response = await server.get('/hotels/1').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.NOT_FOUND);
        })
        it("should respond with status 402 if ticket hasn't been paid", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            
            const response = await server.get('/hotels/1').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it("should respond with status 402 if ticketType is remote", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createRemoteTicketType();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
            const response = await server.get('/hotels/1').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        it("should respond with status 402 if ticketType doesn't include hotel", async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketTypeWithoutHotel();
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            
            const response = await server.get('/hotels/1').set("Authorization", `Bearer ${token}`);
            expect(response.statusCode).toBe(httpStatus.PAYMENT_REQUIRED);
        })
        
        describe("when ticket is valid", () => {
            it("should respond with status 200 and the hotel + rooms listing", async () => {
                const user = await createUser();
                const token = await generateValidToken(user);
                const enrollment = await createEnrollmentWithAddress(user);
                const ticketType = await createValidTicketType();
                const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
                const hotel = await createHotel();

                const response = await server.get('/hotels/' + hotel.id).set("Authorization", `Bearer ${token}`);
                expect(response.statusCode).toBe(httpStatus.OK);
                expect(response.body).toEqual(
                    expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                        image: expect.any(String),
                        createdAt: expect.any(String),
                        updatedAt: expect.any(String),
                        Rooms: expect.arrayContaining([
                            expect.objectContaining({
                                id: expect.any(Number),
                                name: expect.any(String),
                                capacity: expect.any(Number),
                                hotelId: expect.any(Number),
                                createdAt: expect.any(String),
                                updatedAt: expect.any(String)
                            })
                        ])
                    })
                )
            })
        })

    })

})
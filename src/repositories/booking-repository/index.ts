import { prisma } from "@/config";

async function getUsersBookingsById(userId: number) {
    return prisma.booking.findFirst({   
        where: {
            userId
        },
        select: {
            id: true,
            Room: true
        }
    })
}

async function createBooking(userId: number, roomId: number) {
    return prisma.booking.create({
        data: {
            roomId,
            userId
        }
    })
}

function findBookingById(id: number) {
    return prisma.booking.findUnique({
        where: {
            id
        },
        select: {
            id: true,
            roomId: true,
            userId: true
        }
    })
}

function updateRoom(id: number, roomId: number) {
    return prisma.booking.update({
        where: {
            id
        },
        data: {
            roomId
        }
    })
}

const bookingRepositories = {
    getUsersBookingsById,
    createBooking,
    findBookingById,
    updateRoom
};

export default bookingRepositories;
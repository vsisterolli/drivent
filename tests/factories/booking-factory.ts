import { prisma } from "@/config";

async function createBooking(userId: number, roomId: number) {
    await prisma.room.update({
        where: {
            id: roomId
        },
        data: {
            capacity: {
                decrement: 1                    
            }
        }
    })
    return prisma.booking.create({
        data: {
            userId,
            roomId
        }
    })
}

export {
    createBooking
};
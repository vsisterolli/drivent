import { prisma } from "@/config";

function findRoom(id: number) {
    return prisma.room.findUnique({
        where: {
            id
        }
    })
}

function occupyRoom(id: number) {
    return prisma.room.update({
        where: {
            id
        },
        data: {
            capacity: {
                decrement: 1
            }
        }
    })
}

function freeRoom(id: number) {
    return prisma.room.update({
        where: {
            id
        },
        data: {
            capacity: {
                increment: 1
            }
        }
    })
}

const roomRepository = {
    findRoom,
    occupyRoom,
    freeRoom
};

export default roomRepository;
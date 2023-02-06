import { prisma } from "@/config";

async function listHotels() {
    return prisma.hotel.findMany({});
}

async function getHotelWithRooms(id: number) {
    return prisma.hotel.findUnique({
        where: {
            id
        },
        include: {
            Rooms: true
        }
    })
}

const hotelRepository = {
    listHotels,
    getHotelWithRooms
};

export default hotelRepository;
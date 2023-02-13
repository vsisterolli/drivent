import { Hotel, Room } from "@prisma/client";
import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotel() {
  const hotel = await prisma.hotel.create({
    data: {
        name: faker.name.findName(),
        image: faker.internet.url(),
        Rooms: {
            create: [
                {
                    name: faker.name.findName(),
                    capacity: 10
                }
            ]
        }
    }
  })
  return await prisma.hotel.findUnique({
    where: {
        id: hotel.id
    },
    include: {
      Rooms: true
    }
  })
}

export async function createZeroCapacityHotel() {
  await prisma.hotel.create({
    data: {
        name: faker.name.findName(),
        image: faker.internet.url(),
        Rooms: {
            create: [
                {
                    name: faker.name.findName(),
                    capacity: 0
                }
            ]
        }
    }
  })
  return await prisma.hotel.findFirst({
    include: {
      Rooms: true
    }
  })
}

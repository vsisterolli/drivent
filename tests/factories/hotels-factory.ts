import { Hotel } from "@prisma/client";
import { prisma } from "@/config";
import faker from "@faker-js/faker";

export async function createHotel(): Promise<Hotel> {
  return prisma.hotel.create({
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
}

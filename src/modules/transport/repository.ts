import { prisma } from '../../config/prisma';

export const transportRepository = {
  async createFlight(data: {
    bookingId: string;
    airline: string;
    flightNumber: string;
    departureCity: string;
    arrivalCity: string;
    departureAt: Date;
    arrivalAt: Date;
    seatNumber?: string;
    pnr?: string;
  }) {
    return prisma.flightBooking.create({ data });
  },

  async createTrain(data: {
    bookingId: string;
    trainName: string;
    trainNumber: string;
    departureCity: string;
    arrivalCity: string;
    departureAt: Date;
    arrivalAt: Date;
    coach?: string;
    seatNumber?: string;
    pnr?: string;
  }) {
    return prisma.trainBooking.create({ data });
  },

  async createBus(data: {
    bookingId: string;
    busOperator: string;
    departureCity: string;
    arrivalCity: string;
    departureAt: Date;
    arrivalAt: Date;
    seatNumber?: string;
  }) {
    return prisma.busBooking.create({ data });
  },

  async getFlightByBookingId(bookingId: string) {
    return prisma.flightBooking.findUnique({
      where: { bookingId },
    });
  },

  async getTrainByBookingId(bookingId: string) {
    return prisma.trainBooking.findUnique({
      where: { bookingId },
    });
  },

  async getBusByBookingId(bookingId: string) {
    return prisma.busBooking.findUnique({
      where: { bookingId },
    });
  },
};

import { prisma } from '../../config/prisma';
import { transportRepository } from './repository';
import type { CreateFlightBookingDto, CreateTrainBookingDto, CreateBusBookingDto } from './dto';

export const transportService = {
  async addFlight(dto: CreateFlightBookingDto) {
    const booking = await prisma.booking.findFirst({
      where: { id: dto.bookingId, deletedAt: null },
    });
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    const existing = await transportRepository.getFlightByBookingId(dto.bookingId);
    if (existing) {
      throw Object.assign(new Error('Flight already added to this booking'), { statusCode: 409 });
    }
    return transportRepository.createFlight({
      bookingId: dto.bookingId,
      airline: dto.airline,
      flightNumber: dto.flightNumber,
      departureCity: dto.departureCity,
      arrivalCity: dto.arrivalCity,
      departureAt: new Date(dto.departureAt),
      arrivalAt: new Date(dto.arrivalAt),
      seatNumber: dto.seatNumber,
      pnr: dto.pnr,
    });
  },

  async addTrain(dto: CreateTrainBookingDto) {
    const booking = await prisma.booking.findFirst({
      where: { id: dto.bookingId, deletedAt: null },
    });
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    const existing = await transportRepository.getTrainByBookingId(dto.bookingId);
    if (existing) {
      throw Object.assign(new Error('Train already added to this booking'), { statusCode: 409 });
    }
    return transportRepository.createTrain({
      bookingId: dto.bookingId,
      trainName: dto.trainName,
      trainNumber: dto.trainNumber,
      departureCity: dto.departureCity,
      arrivalCity: dto.arrivalCity,
      departureAt: new Date(dto.departureAt),
      arrivalAt: new Date(dto.arrivalAt),
      coach: dto.coach,
      seatNumber: dto.seatNumber,
      pnr: dto.pnr,
    });
  },

  async addBus(dto: CreateBusBookingDto) {
    const booking = await prisma.booking.findFirst({
      where: { id: dto.bookingId, deletedAt: null },
    });
    if (!booking) {
      throw Object.assign(new Error('Booking not found'), { statusCode: 404 });
    }
    const existing = await transportRepository.getBusByBookingId(dto.bookingId);
    if (existing) {
      throw Object.assign(new Error('Bus already added to this booking'), { statusCode: 409 });
    }
    return transportRepository.createBus({
      bookingId: dto.bookingId,
      busOperator: dto.busOperator,
      departureCity: dto.departureCity,
      arrivalCity: dto.arrivalCity,
      departureAt: new Date(dto.departureAt),
      arrivalAt: new Date(dto.arrivalAt),
      seatNumber: dto.seatNumber,
    });
  },
};

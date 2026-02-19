export interface CreateFlightBookingDto {
  bookingId: string;
  airline: string;
  flightNumber: string;
  departureCity: string;
  arrivalCity: string;
  departureAt: string;
  arrivalAt: string;
  seatNumber?: string;
  pnr?: string;
}

export interface CreateTrainBookingDto {
  bookingId: string;
  trainName: string;
  trainNumber: string;
  departureCity: string;
  arrivalCity: string;
  departureAt: string;
  arrivalAt: string;
  coach?: string;
  seatNumber?: string;
  pnr?: string;
}

export interface CreateBusBookingDto {
  bookingId: string;
  busOperator: string;
  departureCity: string;
  arrivalCity: string;
  departureAt: string;
  arrivalAt: string;
  seatNumber?: string;
}

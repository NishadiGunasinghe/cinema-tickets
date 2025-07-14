import TicketService from '../src/pairtest/TicketService.js';
import InvalidAccountIdException from '../src/pairtest/lib/exceptions/InvalidAccountIdException.js';
import TicketLimitExceededException from '../src/pairtest/lib/exceptions/TicketLimitExceededException.js';
import AdultRequiredException from '../src/pairtest/lib/exceptions/AdultRequiredException.js';
import InvalidPurchaseException from '../src/pairtest/lib/exceptions/InvalidPurchaseException.js';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest.js';
import { TICKET_PRICES } from '../src/pairtest/config/TicketPriceConfig.js';

describe('TicketService', () => {

    let mockTicketPaymentService;
    let mockSeatReservationService;
    let ticketService;

    beforeEach(() => {
        mockTicketPaymentService = { makePayment: jest.fn() };
        mockSeatReservationService = { reserveSeat: jest.fn() };
        ticketService = new TicketService(mockTicketPaymentService, mockSeatReservationService);
    });

    // Test account ID validation conditions
    describe('Account ID validation', () => {
        const mockTicketRequest = new TicketTypeRequest('ADULT', 4);

        test('should not throw an error for a valid account id with integers greater than zero', () => {
            expect(() => ticketService.purchaseTickets(1, mockTicketRequest)).not.toThrow();
            expect(() => ticketService.purchaseTickets(1234, mockTicketRequest)).not.toThrow();
        });

        test('should throw an InvalidPurchaseException for negative integers or zero', () => {
            expect(() => ticketService.purchaseTickets(0, mockTicketRequest)).toThrow(InvalidAccountIdException);
            expect(() => ticketService.purchaseTickets(-10, mockTicketRequest)).toThrow(InvalidAccountIdException);
        });

        test('should throw an InvalidPurchaseException for non integer values', () => {
            expect(() => ticketService.purchaseTickets('abc', mockTicketRequest)).toThrow(InvalidAccountIdException);
            expect(() => ticketService.purchaseTickets(1.5, mockTicketRequest)).toThrow(InvalidAccountIdException);
            expect(() => ticketService.purchaseTickets(NaN, mockTicketRequest)).toThrow(InvalidAccountIdException);
        });
    });

    // Test ticket request validation conditions
    describe('Ticket requests validation', () => {

        test('should throw an InvalidPurchaseException when no ticket requests are passed', () => {
            expect(() => ticketService.purchaseTickets(1)).toThrow(InvalidPurchaseException);
        });

        test('should throw an InvalidPurchaseException for zero ticket count', () => {
            const ticketRequest = new TicketTypeRequest('ADULT', 0);

            expect(() => ticketService.purchaseTickets(1, ticketRequest)).toThrow(InvalidPurchaseException);
        });

        test('should throw an InvalidPurchaseException when the number of tickets exceeds the maximum of 25.', () => {
            const requestAdult = new TicketTypeRequest('ADULT', 10);
            const requestChild = new TicketTypeRequest('CHILD', 8);
            const requestInfant = new TicketTypeRequest('INFANT', 8);

            expect(() => ticketService.purchaseTickets(1, requestAdult, requestChild, requestInfant)).toThrow(TicketLimitExceededException);
        });

        test('should throw an InvalidPurchaseException for requests for child or infant tickets without an adult ticket', () => {
            const requestChild = new TicketTypeRequest('CHILD', 3);
            const requestInfant = new TicketTypeRequest('INFANT', 1);

            expect(() => ticketService.purchaseTickets(1, requestChild)).toThrow(AdultRequiredException);
            expect(() => ticketService.purchaseTickets(1, requestInfant)).toThrow(AdultRequiredException);
            expect(() => ticketService.purchaseTickets(1, requestChild, requestInfant)).toThrow(AdultRequiredException);
        });
    });

    // Test total ticket cost calculation logic
    describe('Ticket cost calculation', () => {
        test('should return the correct ticket price according to the requested ticket types', () => {
            //Arrange
            const requestAdult = new TicketTypeRequest('ADULT', 10);
            const requestChild = new TicketTypeRequest('CHILD', 4);

            //Act
            ticketService.purchaseTickets(1, requestAdult, requestChild);

            //Assert
            const expectedTotal = TICKET_PRICES.ADULT * 10 + TICKET_PRICES.CHILD * 4;
            expect(mockTicketPaymentService.makePayment).toHaveBeenCalledWith(1, expectedTotal); 
        });

        test('should not charge for Infant tickets', () => {
            //Arrange
            const requestAdult = new TicketTypeRequest('ADULT', 1);
            const requestChild = new TicketTypeRequest('INFANT', 4);

            //Act
            ticketService.purchaseTickets(1, requestAdult, requestChild);

            //Assert
            const expectedTotal = TICKET_PRICES.ADULT * 1 + TICKET_PRICES.INFANT * 4;
            expect(mockTicketPaymentService.makePayment).toHaveBeenCalledWith(1, expectedTotal); 
        });
    });

    // Test seat reservation logic
    describe('Seat Reservation', () => {
        test('should reserve one seat for each adult and child', () => {
            //Arrange
            const requestAdult = new TicketTypeRequest('ADULT', 4);
            const requestChild = new TicketTypeRequest('CHILD', 2);

            //Act
            ticketService.purchaseTickets(1, requestAdult,requestChild);
            
            //Assert
            expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 6);
        });

        test('should not reserve a seat for infants', () => {
            //Arrange
            const requestAdult = new TicketTypeRequest('ADULT', 10);
            const requestChild = new TicketTypeRequest('CHILD', 8);
            const requestInfant = new TicketTypeRequest('INFANT', 4);

            //Act
            ticketService.purchaseTickets(1, requestAdult,requestChild,requestInfant);
            
            //Assert
            expect(mockSeatReservationService.reserveSeat).toHaveBeenCalledWith(1, 18);
        });
    });
});
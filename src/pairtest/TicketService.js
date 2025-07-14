import InvalidAccountIdException from './lib/exceptions/InvalidAccountIdException.js';
import TicketLimitExceededException from './lib/exceptions/TicketLimitExceededException.js';
import AdultRequiredException from './lib/exceptions/AdultRequiredException.js';
import InvalidPurchaseException from './lib/exceptions/InvalidPurchaseException.js';
import { TICKET_PRICES } from './config/TicketPriceConfig.js';

export default class TicketService {
  #ticketPaymentService;
  #seatReservationService;

  constructor(ticketPaymentService, seatReservationService) {
    this.#ticketPaymentService = ticketPaymentService;
    this.#seatReservationService = seatReservationService;
  }

  /**
     * Validate the account ID:
        * - Should be an integer and greater than 0
  */
  #validateAccountID(accountId){
    if(!Number.isInteger(accountId) || accountId <= 0){
      throw new InvalidAccountIdException();
    }
  }

  /**
     * Get a summary of ticket request containing:
        *   - Number of tickets per type (ADULT, CHILD, INFANT)
        *   - totalTickets: total number of tickets requested
  */
  #GetTicketSummery(ticketTypeRequests){
    const tickets = { INFANT: 0, CHILD: 0, ADULT: 0, totalTickets: 0 };

    ticketTypeRequests.forEach(req => {
      const type = req.getTicketType();
      const count = req.getNoOfTickets();

      tickets[type] = (tickets[type] ?? 0) + count;
      tickets.totalTickets += count; 
    });

    return tickets;
  }

  /**
     * Validate the ticket requests:
        * - Should request at least 1 ticket
        * - Allowed max 25 tickets for one account
        * - Child or infant cannot requests tickets without an adult ticket
  */
  #validateTicketRequests(requestSummary) {
    if(requestSummary.totalTickets === 0){
      throw new InvalidPurchaseException();
    }
    if(requestSummary.totalTickets > 25){
      throw new TicketLimitExceededException();
    }

    if(requestSummary.ADULT === 0 && (requestSummary.CHILD > 0 || requestSummary.INFANT > 0)){
      throw new AdultRequiredException();
    }
  }

  /**
     * Calculate the total number of seats:
        * - Infant is not allocated a separate seat.
  */
  #calculateSeats(requestSummary){
    return requestSummary.ADULT + requestSummary.CHILD;
  }

  /**
      * Calculates the total cost of all ticket requests based on ticket type and quantity.
  */
  #calculateTicketCosts(requestSummary){
    let totalCost = 0;

    for (const [type, price] of Object.entries(TICKET_PRICES)) {
      totalCost += price * (requestSummary[type] ?? 0);
    }

    return totalCost;
  }

  //existing method
  purchaseTickets(accountId, ...ticketTypeRequests) {

    // Step 1: Validate the account ID
    this.#validateAccountID(accountId);

    // Step 2: Get the requested ticket summary from ticketTypeRequests.
    const requestSummary = this.#GetTicketSummery(ticketTypeRequests);

    // Step 3: Validate the ticket requests
    this.#validateTicketRequests(requestSummary);

    // Step 4: Calculate total payment for ticket requests
    const totalPayment = this.#calculateTicketCosts(requestSummary);

    // Step 5: Process payment through external TicketPaymentService service
    this.#ticketPaymentService.makePayment(accountId, totalPayment);

    // Step 6: Determine number of seats to reserve according to the ticket requests
    const noOfSeats = this.#calculateSeats(requestSummary);
     
    // Step 7: Reserve seats through external SeatReservationService service
    this.#seatReservationService.reserveSeat(accountId, noOfSeats);
  }  
}

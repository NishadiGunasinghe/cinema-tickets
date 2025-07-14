# Cinema Ticket Booking Service

A Node.js application that processes ticket purchase requests, including payment calculation, payment completion, and seat reservations according to strict business rules.

---
## Objectives

This service implements `TicketService`, which:
  - Validates ticket purchase requests according to the given business rules.
  - Calculates the total cost of tickets.
  - Reserves the required number of seats (excluding infants).
  - Interacts with external `TicketPaymentService` and `SeatReservationService`.

--
## Validation Rules
  - At least one ticket must be purchased.
  - A maximum of 25 tickets are allowed per request.
  - Child and infant tickets cannot be purchased without at least one adult ticket.
  - Infants do not reserve a seat.

--
## Getting Started

  ### Prerequisites
    - Node.js
    - npm or yarn

  ### Install Dependencies
  
    ```bash
    npm install

  ### Run Tests
  
    ```bash
    npm test

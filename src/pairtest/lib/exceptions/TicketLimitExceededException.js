import PurchaseException from './PurchaseException.js';

export default class TicketLimitExceededException extends PurchaseException {
  constructor() {
    super('Sorry!! You have already reached the maximum number of tickets - 25.');
    this.name = 'TicketLimitExceededException';
  }
}
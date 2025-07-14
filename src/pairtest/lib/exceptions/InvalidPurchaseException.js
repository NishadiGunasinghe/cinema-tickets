import PurchaseException from './PurchaseException.js';

export default class InvalidPurchaseException extends PurchaseException {
  constructor() {
    super('You should buy at least one ticket.');
    this.name = 'InvalidPurchaseException';
  }
}
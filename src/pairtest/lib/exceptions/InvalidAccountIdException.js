import PurchaseException from './PurchaseException.js';

export default class InvalidAccountIdException extends PurchaseException {
  constructor() {
    super('Invalid account ID!!');
    this.name = 'InvalidAccountIdException';
  }
}

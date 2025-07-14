import PurchaseException from './PurchaseException.js';

export default class AdultRequiredException extends PurchaseException {
  constructor() {
    super('You will need at least one adult ticket to purchase a child or infant ticket.');
    this.name = 'AdultRequiredException';
  }
}
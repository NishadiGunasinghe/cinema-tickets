export default class PurchaseException extends Error {
    constructor(message) {
        super(message);
        this.name = 'PurchaseException';
    } 
}
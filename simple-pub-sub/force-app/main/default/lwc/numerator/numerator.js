import { LightningElement, api } from 'lwc';

export default class Numerator extends LightningElement {
    //Using the @api decorator in this child component
    //exposes counter, making it public, so the parent
    //component can update it.
    //@api counter = 0;
    //using a getter/setter to retain the prior value
    //of the counter
    _currentCount = 0;
    priorCount = 0;
    @api
    get counter() {
      return this._currentCount;
    }
    set counter(value) {
      this.priorCount = this._currentCount;
      this._currentCount = value;
    }

    //Using the @api decorator for this function makes
    //it public so the parent component can call it.
    @api
    maximizeCounter() {
      this.counter += 1000000;
    }

    counter = 0;
    handleIncrement() {
      this.counter++;
    }

    handleDecrement() {
      this.counter--;
    }

    handleMultiply(event) {
        const factor = event.detail;
        this.counter *= factor;
      }
}
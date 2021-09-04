import {observable, computed, action} from 'mobx';

export class TransactionStore {
  @observable price;
  @observable quantity;

  constructor(value) {
    this.id = 9;
    this.quantity = 11;
  }

  @computed get total() {
    return this.price * this.quantity;
  }

  // Use @action to modify state value
  @action setPrice = price => {
    this.price = price;
  };

  // Use @action to modify state value
  @action setQuantity = quantity => {
    this.quantity = quantity;
  };
}

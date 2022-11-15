import {createContainer} from '../index';
const container = createContainer();

function service1Factory(ref1) {
  return new Service1(ref1);
}

class Service1 {
  constructor(ref1) {
    this.ref1 = ref1;
  }
  f2() {
    console.log(this.ref1.f1());
  }
}

container
  .addRef('ref1', {f1: () => 'Ok'})
  .register(service1Factory, 'service1');
container.service1.f2();

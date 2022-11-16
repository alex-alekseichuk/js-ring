import {createContainer} from '../index';
const container = createContainer();

function service1(ref1) {
  return new ServiceClass(ref1);
}
const service2Factory = ref1 => new ServiceClass(ref1);

class ServiceClass {
  constructor(ref1) {
    this.ref1 = ref1;
  }
  f2() {
    console.log(this.ref1.f1());
  }
}

container
  .addRef('ref1', {f1: () => 'Ok'})
  .register(service1)
  .register(service2Factory, 'service2');
container.service1.f2();
container.service2.f2();

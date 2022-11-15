'use strict';

/**
 * Chai assertion: obj has all methods listed in methods array.
 * @param {Object} obj - target object
 * @param {array} methods - array of methods names
 */
export function hasMethods(obj, methods) {
  methods.forEach(method => {
    obj.should.have.property(method);
    obj[method].should.be.a('function');
  });
}

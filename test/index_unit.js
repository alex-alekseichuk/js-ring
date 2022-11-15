'use strict';
import * as chai from 'chai';
chai.should();

import { hasMethods } from './utils';
import {createContainer} from '../index';

describe('Context module', () => {
  describe('context instance', () => {
    let container;
    before(() => {
      container = createContainer();
    });
    it('should have methods: clone, addRef, inject, register', () => {
      hasMethods(container, ['clone', 'addRef', 'inject', 'register']);
    });
    describe('cloned context', () => {
      let clonedContainer;
      before(() => {
        container.a = 'a1';
        container.b = 'b1';
        clonedContainer = container.clone({b: 'b2', c: 'c2'});
      });
      it('should have properties of parent context', () => {
        clonedContainer.d = 'd21';
        clonedContainer.should.have.property('a', 'a1');
        clonedContainer.should.have.property('b', 'b2');
        clonedContainer.should.have.property('c', 'c2');
        container.should.have.property('b', 'b1');
      });
    });
    describe('add method', () => {
      it('should update implementation on second add call', () => {
        container.addRef('interface', {f: () => "impl1"});
        const instance = container.interface;
        instance.f().should.be.equal("impl1");
        container.addRef('interface', {f: () => "impl2"});
        instance.f().should.be.equal("impl2");
      });
      it('should not update implementation of direct dependency', () => {
        container.interface = {f: () => "impl1"};
        const instance = container.interface;
        instance.f().should.be.equal("impl1");
        container.addRef('interface', {f: () => "impl2"});
        instance.f().should.be.equal("impl1");
      });
      it('should not update parent context', () => {
        container.addRef('cloned1', {f: 'cloned1'});
        const clonedContext = container.clone();
        clonedContext.addRef('cloned1', {f: 'cloned2'});
        container.cloned1.f.should.be.equal('cloned1');
        clonedContext.cloned1.f.should.be.equal('cloned2');
      });
    });
    describe('load method', () => {
      it('should load dependency into the context', async () => {
        const factory = function sync1(a, b) {
          return {
            f: () => a + b
          };
        };
        const self = container.register(factory, {b: 'load'});
        self.should.be.equal(container);
        container.should.have.property('sync1');
        container.sync1.f().should.be.equal('a1load');
      });
      it('should load a set of dependencies into the context', async () => {
        const factory = function sync1(a, b) {
          const main = {f11: () => 'f11'};
          main.__components = {main, second: {f12: () => 'f12'}};
          return main;
        };
        const self = container.register(factory, {b: 'load'});
        self.should.be.equal(container);
        container.should.have.property('main');
        container.main.f11().should.be.equal('f11');
        container.should.have.property('second');
        container.second.f12().should.be.equal('f12');
      });
      it('should load promise dependency into the context', () => {
        const factoryP = async function asyncP(a, b) {
          return {
            f: () => a + b
          };
        };
        const selfP = container.register(factoryP, {b: 'load'});
        selfP.then(self => {
          self.should.be.equal(container);
          container.should.have.property('asyncP');
          container.asyncP.should.have.property('f');
          container.asyncP.f.should.be.a('function');
          container.asyncP.f().should.be.equal('a1load');
        });
      });
      it('should load promise a set of dependencies into the context', () => {
        const factoryP = async function asyncP(a, b) {
          const main = {f21: () => 'f21'};
          main.__components = {main, second: {f22: () => 'f22'}};
          return main;
        };
        const selfP = container.register(factoryP, {b: 'load'});
        selfP.then(self => {
          self.should.be.equal(container);
          container.should.have.property('main');
          container.main.should.have.property('f21');
          container.main.f21.should.be.a('function');
          container.main.f21().should.be.equal('f21');
          container.should.have.property('second');
          container.second.should.have.property('f22');
          container.second.f22.should.be.a('function');
          container.second.f22().should.be.equal('f22');
        });
      });
      it('should load async dependency into the context', async () => {
        const asyncFactory = async function async1(a, b) {
          return {
            f: () => a + b
          };
        };
        const self = await container.register(asyncFactory, {b: 'load'});
        self.should.be.equal(container);
        container.should.have.property('async1');
        container.async1.f().should.be.equal('a1load');
      });
      it('should load async a set of dependencies into the context', async () => {
        const asyncFactory = async function async1(a, b) {
          const main = {f31: () => 'f31'};
          main.__components = {main, second: {f32: () => 'f32'}};
          return main;
        };
        const self = await container.register(asyncFactory, {b: 'load'});
        self.should.be.equal(container);
        container.should.have.property('main');
        container.main.f31().should.be.equal('f31');
        container.should.have.property('second');
        container.second.f32().should.be.equal('f32');
      });
    });
  });
});

/**
 * IoC/DI container implementation.
 * Almost all modules should be registered in the container, to be available later via DI.
 */

/**
 * Create root container.
 * @return {Object} Context interface
 */
export function createContainer() {
  return {
    /**
     * Create one more container based on current one.
     * It's for narrow functionality, authorized, scoped or customized container.
     * Basically, there is the root container with common dependencies.
     * There would be scoped child container with specific implementations.
     * There would be data child container with specific data but use parent container services/dependencies.
     *
     * @param {Object} [dependencies] - A set of custom dependencies and settings/data for new container
     * @return {Object} Cloned child container
     */
    clone(dependencies) {
      const container = Object.create(this);

      if (dependencies) Object.assign(container, dependencies);

      return container;
    },

    /**
     * Added reference to object representing an interface of some dependency.
     * By default, it's added as a proxy, so, later you can update it.
     * Besides, you can override it in child container.
     *
     * @param {string} name - The name of the dependency
     * @param {Object} ref - The service to be added to the container
     * @return {Object} Current container
     */
    addRef(name, ref) {
      if (!this.hasOwnProperty(name)) {
        if (typeof ref === 'function') {
          this[name] = ref;

          return this;
        }
        const proxy = Object.create(ref);

        proxy.__proxy = true;
        this[name] = proxy;

        return this;
      }
      const existing = this[name];

      if (existing.__proxy) {
        Object.setPrototypeOf(existing, ref);

        return this;
      }
      this[name] = ref;

      return this;
    },

    /**
     * Inject arguments into factory function by their names.
     * Dependencies are getting from the container or from the dependencies parameter.
     *
     * @param {function} factory - Function to instantiate the instance with all dependencies
     * @param {Object} [dependencies] - Object with custom dependencies to override dependencies from the container
     * @return {Object} Returned by factory function
     */
    inject(factory, dependencies) {
      const self = this;

      if (!factory || typeof factory !== 'function') return null;

      const names = factory.__dependencies || getFuncArgs(factory);

      return factory.apply(this,
        names.map((name) => {
          if (dependencies && typeof dependencies[name] !== 'undefined') return dependencies[name];
          if (name === 'container') return self;
          if (!self[name] && self.logger) {
            self.logger.warn(`Can't inject dependency: ${name}`);
          }

          return self[name];
        }));
    },

    /**
     * Instantiates the instance with dependencies and add it to the container.
     *
     * @param {any} factory - Function to instantiate the instance with all dependencies
     * @param {Object} [dependencies] - Object with custom dependencies to override dependencies from the container
     * @param {string} [name] - Custom name to use instead of original one
     * @return {Object} Current container
     */
    register(factory, dependencies, name) {
      const self = this;

      if (typeof dependencies === 'string') {
        name = dependencies;
        dependencies = undefined;
      }

      if (typeof factory !== 'function') {
        if (name) self._add(name, factory);
        else if (factory.__name) self._add(factory.__name, factory);
        else if (factory.__components) self._add(null, factory);

        return self;
      }
      const ref = this.inject(factory, dependencies);

      if (!ref) return self;

      if (typeof ref.then === 'function') {
        const _name = name || factory.__name || factory.name;

        return ref
          .then((instance) => {
            if (instance) {
              self._add(_name, instance);
            } else if (this.logger) this.logger.error(`Can't inject ${_name}`);

            return self;
          })
          .catch((err) => {
            if (this.logger) this.logger.error(`Can't inject ${_name}`);
          });
      }

      const _name = name || factory.__name || factory.name;

      if (!ref) {
        if (this.logger) this.logger.error(`Can't inject ${_name}`);

        return this;
      }
      this._add(_name, ref);

      return self;
    },

    /**
     * Add single component or a set of interfaces from __components property
     * @param {string} name - the name of single component
     * @param {Object} ref - main component
     * @private
     */
    _add(name, ref) {
      if (ref.__components) {
        for (const [key, value] of Object.entries(ref.__components)) this.addRef(key, value);

        return;
      }
      if (name) this.addRef(name, ref);
    },
  };
}

/**
 * Get arguments names of the function.
 * @param {function} func - target function
 * @return {Array} arrays of args names
 */
function getFuncArgs(func) {
  let str = func.toString();

  // Remove comments of the form /* ... */
  // Removing comments of the form //
  // Remove body of the function { ... }
  // removing '=>' if func is arrow function
  str = str.replace(RegExp('\\/\\*[\\s\\S]*?\\*\\/', 'g'), '')
    .replace(RegExp('\\/\\/(.)*', 'g'), '')
    .replace(RegExp('{[\\s\\S]*}'), '')
    .replace(RegExp('=>', 'g'), '')
    .trim();

  // Start parameter names after first '('
  const start = str.indexOf('(') + 1;

  // End parameter names is just before last ')'
  const end = str.length - 1;

  const result = str.substring(start, end).split(',');

  return result
    .map(element => element.replace(RegExp('=[\\s\\S]*', 'g'), '').trim())
    .filter(element => element.length > 0);
}

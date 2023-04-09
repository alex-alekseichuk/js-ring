# js-ring

IoC / DI container for pure JavaScript projects

`D` in SOLID means `Dependency Inversion`.
Any enterprise solutions or a project should use such a tools.
JavaScript is not an exception.
I use this module
to manage dependencies of the components
in node.js and in-browser applications.

A component is object or function returned by factory function.
By default, the name of the component is the same as name of the factory function.
Names of factory arguments are the names of other components used as dependencies.

```javascript
function component1(component2, component3) {
  return {
    method1: () => {},
    method2: () => {}
  };
}
```

## Container

Container is a plain JavaScript object.
It contains references to the interfaces and the data.
In the simple case, there is a single container.

```javascript
import { createContainer } from 'js-ring';
const container = createContainer();
```

The injection is done for factory functions.

## Tree of containers

We can clone a child container from the parent container.
Then specify another implementation in the child container.
There is a tree of containers:

```
  Root -- Domain1 -- Application1 -- Request1024
       -- Domain1 -- Application2 -- Request2049
       -- Domain2 -- Application1 -- RequestXXXX
```

1. Some nodes (contexts) contains references to interfaces
    There are single ones per server/application/domain.
    Such contexts are used as DI/IoC containers.
    E.g., Root, Domain, Application.
2. Another ones contains only some specific data
    and inherit all functions from their parents.
    Such ones created all the time.
    E.g., Request, Message.

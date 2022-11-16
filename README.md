# js-ring

IoC / DI container for pure JavaScript projects.

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

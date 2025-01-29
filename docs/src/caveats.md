# Caveats

There are some caveats of working with lazy objects. First, the construction of
broadcasted objects and their execution can become separated, requiring more
thought and introducing harder-to-debug problems. Second, creating complex
`Broadcasted` objects can increase compile time.

## Delayed execution can be confusing

For example:

```@example caveats
using LazyBroadcast: lazy_broadcast
a = [0, 0]
b = [0, 0]
c = lazy_broadcast.(a .+ b)
a .= [1, 1]
b .= [1, 1]
nothing
```

What do you suppose that the result of `Base.materialize(c)` is now? Let's see:

```@example caveats
Base.materialize(c)
```

Tada! `c` is a `Base.Broadcasted` object that holds _pointers_ to the data `a`
and `b`, so even though we've since mutated `a` and `b` _after_ assigning `c`,
materializing `c` will yield results for whatever values that `a` and `b`
contain at that instant. This might be surprising at first, but it's also very
powerful. We can think of `c` as an _expression_, that holds true for whatever
values we put into `a` and `b`.

## Compilation time

`Broadcasted` objects are stack-allocated, and therefore increasingly large
broadcast expressions may result in increased compilation times.


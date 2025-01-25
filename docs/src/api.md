# API

## Featured functions and macros

LazyBroadcast defines two exported functions:
 
 - `lazy_broadcast` - the main feature of LazyBroadcast, which turns broadcast expressions into lazy broadcasted objects.
 - `@lazy_broadcast` - which allows users to call `lazy_broadcast` without parenthesis.

and two un-exported functions (un-exported intentionally to avoid name collisions)

 - `lazy` - an alias of `lazy_broadcast`
 - `@lazy` - an alias of `@lazy_broadcast`

## `lazy_broadcast`

```@docs
LazyBroadcast.lazy_broadcast
```

# API

## Featured functions and macros

LazyBroadcast defines two exported functions:
 
 - `lazy_broadcast` - the main feature of LazyBroadcast, which turns broadcast expressions into lazy broadcasted objects.
 - `@lazy_broadcast` - which allows users to call `lazy_broadcast` without parenthesis.

and two un-exported functions (un-exported intentionally to avoid name collisions)

 - `lazy` - an alias of `lazy_broadcast`
 - `@lazy` - an alias of `@lazy_broadcast`

It also defines these un-exported names:

 - `NullBroadcasted` - a broadcast object that vanishes from sums and makes products vanish.
 - `fused_direct`, `fused_assemble`, `@make_type`, `@make_fused` and `@make_get_fused` - tools for fusing several broadcast expressions into one loop.

## `lazy_broadcast`

```@docs
LazyBroadcast.lazy_broadcast
```

## `NullBroadcasted`

```@docs
LazyBroadcast.NullBroadcasted
```

## Broadcast fusion

```@docs
LazyBroadcast.fused_direct
LazyBroadcast.fused_assemble
LazyBroadcast.@make_type
LazyBroadcast.@make_fused
LazyBroadcast.@make_get_fused
```

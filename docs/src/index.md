# LazyBroadcast.jl

## Purpose

We believe that software should be

 - simple
 - unit tested
 - fast
 - granular

LazyBroadcast.jl helps us achieve this by providing a function,
[`lazy_broadcast`](@ref LazyBroadcast.lazy_broadcast).

This function can be used to transform a given Julia broadcast expression into
broadcasted objects and without materializing them.

To try this out, see our quick-start guide.

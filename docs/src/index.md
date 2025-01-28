# LazyBroadcast.jl

The goal of this package is to help users write faster and more
unit-test-friendly code, by avoiding temporary allocations, fusing operations,
and enabling a more functional-programming design with Julia's broadcasting.

This is achieved via [`lazy_broadcast`](@ref LazyBroadcast.lazy_broadcast).
`lazy_broadcast`.

To try this out, see our [Quick start](@ref), or see how this works in the
[Internals of how `lazy_broadcast` works](@ref) section.

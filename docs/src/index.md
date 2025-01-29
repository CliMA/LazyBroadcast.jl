# LazyBroadcast.jl

`LazyBroadcast.jl` defers the execution of Julia's broadcast expressions. This
improves performance by avoiding unnecessary temporary allocations and enabling
operation fusion. It also facilitates a more functional programming style within
Julia packages.

The core functionality is provided by the [`lazy_broadcast`](@ref
LazyBroadcast.lazy_broadcast) function. See the [Quick start](@ref) section for
examples demonstrating performance improvements.

For detailed usage instructions, refer to [Usage](@ref). The [Motivation](@ref)
section explains scenarios where `LazyBroadcast.jl` is particularly beneficial.

Finally, the [Internals of how `lazy_broadcast` works](@ref) section describes
the implementation details of `lazy_barodcast`.

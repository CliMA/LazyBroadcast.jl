# Quick start

This example demonstrates how `LazyBroadcast.jl` can significantly improve the performance of Julia code.

Let's compute the sum of the elements in a vector `z`, derived from another vector `x` in two steps: `y = x .+ x` and `z = 2 .* y`.

The simplest code that accomplishes this task is:
```julia
y = x .+ x
z = 2 .* y
sum(z)
```

Let us use [BenchmarkTools](https://juliaci.github.io/BenchmarkTools.jl/) to
benchmark this code:
```@example quick
using BenchmarkTools  # For accurate benchmarking

function foo(x)
   y = x .+ x
   z = 2 .* y
   sum(z)
end;

print(@btime foo(v) setup=(v=rand(10)))
```

`BenchmarkTools` identifies that are [heap
allocations](https://en.wikipedia.org/wiki/C_dynamic_memory_allocation)
allocations, which are know to severely [impacting
performance](https://docs.julialang.org/en/v1/manual/performance-tips/#Measure-performance-with-[@time](@ref)-and-pay-attention-to-memory-allocation).

`LazyBroadcast.jl` provides a simple way to remove these allocations. To do so,
we just need to add [`lazy_broadcast`](@ref LazyBroadcast.lazy_broadcast) to the
broadcasted operations (operations with a dot `.`):
```@example quick
using LazyBroadcast: lazy_broadcast

function foo_lazy(x)
   # use lazy_broadcast to avoid intermediate allocations
   y = lazy_broadcast.(x .+ x)
   z = lazy_broadcast.(2 .* y)
   sum(z)
end;

print(@btime foo_lazy(v) setup=(v=rand(10)))
```

As we can see, `BenchmarkTools` now reports 0 bytes allocated and a significant
reduction in the overall runtime (on my computer, the benchmarks take `43.433
ns` and `5.917 ns`, respectively, a 7x speedup!).

What happened here is that `y` and `z` are no longer `Array`s, but `Broadcasted`
objects, which are unevaluated representations of expressions. Then, the
function `sum` implementation efficiently evaluates the `Broadcasted` expression, removing the need for any
intermediate allocations.

Now that you know what to expect from [`lazy_broadcast`](@ref
LazyBroadcast.lazy_broadcast), jump to the [Usage](@ref) section to read more
about how to work with `LazyBroadcast` and `Broadcasted` objects.

If you're interested in the implementation, check out the [Internals of how
`lazy_broadcast` works](@ref) section.

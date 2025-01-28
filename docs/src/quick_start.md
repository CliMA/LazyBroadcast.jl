# Quick start

Suppose we want to sum a vector, which is the result of multiple broadcast
expressions: `y = x .+ x`, `z = 2 .* y`, and, finally, `sum(z)`. We might first
write this as:

```@example quick
using Base.Broadcast: materialize
using LazyBroadcast: lazy_broadcast
using BenchmarkTools

function foo(x)
   y = x .+ x
   z = 2 .* y
   sum(z)
end;

print(@btime foo(v) setup=(v=rand(10)))
```

As you can see, there are [heap](https://en.wikipedia.org/wiki/Heap_
(data_structure)) allocations, which are impacting performance. Now, let's use
LazyBroadcast.jl's [`lazy_broadcast`](@ref LazyBroadcast.lazy_broadcast) to
eliminate the intermediate allocations:

```@example quick
function foo_lazy(x)
   # use lazy_broadcast to avoid intermediate allocations
   y = lazy_broadcast.(x .+ x)
   z = lazy_broadcast.(2 .* y)
   sum(z)
end;

print(@btime foo_lazy(v) setup=(v=rand(10)))
```

On my computer, the benchmarks take `43.433 ns` and `5.917 ns`, respectively.
So, using LazyBroadcast results in a 7x speedup. This demonstrates the power of
using [`lazy_broadcast`](@ref LazyBroadcast.lazy_broadcast), which has allowed
us to avoid temporary allocations.

If you're interested, check out the [How `lazy_broadcast` works](@ref) section.

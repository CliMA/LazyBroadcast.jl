# Quick start

Suppose we want to sum a vector, which is the result of multiple broadcast
expressions: `y = x .+ x`, `z = 2 .* y`, and, finally, `sum(z)`. Let's write
this in a function, `foo`, and compare the result of using [`lazy_broadcast`]
(@ref LazyBroadcast.lazy_broadcast) to compute the intermediate values.

```@example
using Base.Broadcast: materialize
using LazyBroadcast: lazy_broadcast
using BenchmarkTools

function foo(x)
   y = x .+ x
   z = 2 .* y
   sum(z)
end;

trial = @benchmark foo(v) setup=(v=rand(10))
show(stdout, MIME("text/plain"), trial)
println()

function bar(x)
   y = lazy_broadcast.(x .+ x)
   z = lazy_broadcast.(2 .* y)
   sum(z)
end;

trial = @benchmark bar(v) setup=(v=rand(10))
show(stdout, MIME("text/plain"), trial)
println()
```

On my computer, the benchmarks take `43.433 ns` and `5.917 ns`, respectively.
So, using LazyBroadcast results in a 7x speedup. This demonstrates the power of
using [`lazy_broadcast`](@ref LazyBroadcast.lazy_broadcast), which allows us to avoid allocating temporary arrays.


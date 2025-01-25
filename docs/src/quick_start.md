# Quick start

Suppose we want to sum a vector, which is the result of multiple broadcast
expressions: `y = x .+ x`, `z = 2 .* y`, and, finally, `sum(z)`. Let's write
this in a function, `foo`, and compare the result of using `lazy_broadcast` to
compute the intermediate values.

```@example
using Base.Broadcast: materialize
using LazyBroadcast: lazy_broadcast
using BenchmarkTools

function foo(x)
   y = x .+ x
   z = 2 .* y
   sum(z)
end;

@benchmark foo(v) setup=(v=rand(10))

function bar(x)
   y = lazy_broadcast.(x .+ x)
   z = lazy_broadcast.(2 .* y)
   sum(z)
end;

@benchmark bar(v) setup=(v=rand(10))
bc = lazy_broadcast.(2 .* [1,2,3])
materialize(bc)
```

On my computer, the benchmarks take `43.433 ns` and `5.917 ns`, respectively.
So, using LazyBroadcast results in a 7x speedup. This is achieved by avoiding
temporary array allocations.

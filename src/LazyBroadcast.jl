module LazyBroadcast

using Base.Broadcast: materialize, instantiate

export lazy_broadcast, materialize

"""
    function lazy_broadcast end # exported
    const lazy = lazy_broadcast # not exported

This function has no methods and is only meant to be used to consume a broadcast
expression, causing it to not materialize, allowing it to be used in a lazy
manner and be consumed later.

For example, consider the situation where one wants to break up a complicated
broadcast expression into multiple steps, and then sum up all of the
components:

```julia
julia> using BenchmarkTools

julia> function foo(x)
           y = x .+ x
           z = 2 .* y
           sum(z)
       end;

julia> @btime foo(v) setup=(v=rand(10))
  43.096 ns (2 allocations: 288 bytes)
20.37839658590829
```

This is significantly slower than it needs to be because new arrays need to be
allocated for `y` and `z`, and the data needs to be passed over multiple times
because the broadcast kernels are not 'fused'.

`DontMaterialize` gives a simple way to avoid these allocations and retain
broadcast fusion:

```julia
julia> using BenchmarkTools, LazyBroadcast

julia> function foo_lazy(x)
           y = lazy_broadcast.(x .+ x)
           z = lazy_broadcast.(2 .* y)
           sum(z)
       end;

julia> @btime foo_lazy(v) setup=(v=rand(10))
  5.958 ns (0 allocations: 0 bytes)
23.002907370961225
```

the result of a `lazy_broadcast` call can be collected into an array with the
`materialize` function (re-exported here from `Base.Broadcast`):

```julia
julia> lazy_broadcast.(2 .* [1,2,3])
Broadcasted{Base.Broadcast.DefaultArrayStyle{1}}(*, (2, [1, 2, 3]))

julia> materialize(ans)
3-element Vector{Int64}:
 2
 4
 6
```
"""
function lazy_broadcast end
const lazy = lazy_broadcast

struct LazyBroadcasted{T}
    value::T
end
Base.Broadcast.broadcasted(::typeof(lazy_broadcast), x) = LazyBroadcasted(x)
Base.materialize(x::LazyBroadcasted) = instantiate(x.value)

macro lazy_broadcast(expr)
    return quote
        LazyBroadcast.lazy_broadcast.($(esc(expr)))
    end
end

macro lazy(expr)
    return quote
        LazyBroadcast.lazy_broadcast.($(esc(expr)))
    end
end

include("code_lowered_single_expression.jl")

end # module LazyBroadcast

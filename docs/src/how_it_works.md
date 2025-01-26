# How `lazy_broadcast` works

It's actually very simple, and the entire package can be written in a few lines
of code:

```julia
using Base.Broadcast: broadcasted, materialize, instantiate
function lazy_broadcast end
struct LazyBroadcasted{T}
    value::T
end
Base.Broadcast.broadcasted(::typeof(lazy_broadcast), x) = LazyBroadcasted(x)
Base.materialize(x::LazyBroadcasted) = instantiate(x.value)
```

That's it. If you have not read the section on [broadcast background]
(https://clima.github.io/LazyBroadcast.jl/dev/broadcast_background/), then you
may want to read that, first. Assuming you've read that section, the idea is
simple, and we can outline what happens in a few steps. Let's first consider a
simple example:

```julia
x = [1, 2]
y = [1, 2]
z = x .+ y
```

First, the code is lowered, and we can see what the code is lowered to using
Julia's meta-programming utilities:

```julia
julia> Meta.@lower(x .+ y)
:($(Expr(:thunk, CodeInfo(
    @ none within `top-level scope`
1 ─ %1 = Base.broadcasted(+, x, y)
│   %2 = Base.materialize(%1)
└──      return %2
))))
```

Now, you can see that our expression is transformed into a `CodeInfo` object,
which contains a sequence of steps. If we back-substitute these expressions, we
get `Base.materialize(Base.broadcasted(+, x, y))`, which is exactly what `LazyBroadcast.code_lowered_single_expression(:(x .+ y))`
returns:

```julia
julia> LazyBroadcast.code_lowered_single_expression(:(x .+ y))
:(Base.materialize(Base.broadcasted(+, x, y)))
```

Note that `Base.materialize` calls `Base.Broadcast.instantiate` on the input
argument, so let's take a look at the instantiated argument to `Base.materialize`:

```julia
julia> Base.Broadcast.instantiate(Base.broadcasted(+, x, y))
Base.Broadcast.Broadcasted{Base.Broadcast.DefaultArrayStyle{1}}(+, ([1, 2], [1, 2]))
```

Here's where the magic comes in. Looking back at the implementation from above,
we know that

 - When we broadcast `lazy_broadcast` over an expression `x`, `Base.broadcasted` returns `LazyBroadcasted(expr)`, and
 - `Base.materialize(::LazyBroadcast)` simply returns `x`

So, the result is:

```julia
julia> bc = LazyBroadcast.lazy_broadcast.(x .+ y)
Base.Broadcast.Broadcasted{Base.Broadcast.DefaultArrayStyle{1}}(+, ([1, 2], [1, 2]))
```

In other words, we get back the instantiated argument to `Base.materialize`.
What's important to note here is that no computations occur until
`Base.materialize`, so `LazyBroadcast.lazy_broadcast.(x .+ y)` returns a "lazy"
object (a `Base.Broadcasted` object) that we can launch computations on, at any
moment, by calling `Base.materialize(bc)`.


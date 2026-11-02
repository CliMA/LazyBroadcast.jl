# Fusing multiple broadcasts

Consider two broadcast expressions that read the same arrays:

```julia
x1 = rand(3,3)
x2 = rand(3,3)
x3 = rand(3,3)
x4 = rand(3,3)
y1 = rand(3,3)
y2 = rand(3,3)

# 2 writes, 4 unique reads, but 8 reads including redundant ones
@. y1 = x1 * x2 + x3 * x4
@. y2 = x1 * x3 + x2 * x4
```

There are 4 unique reads and 2 writes. Because the reads are in two separate
broadcast expressions, there are 8 reads in total. One fix is to change the
memory layout:

```julia
X = map(x->Tuple(rand(4)),zeros(3,3));
Y = map(x->Tuple(rand(2)),zeros(3,3));

foo(x) = (x[1] * x[2] + x[3] * x[4], x[1] * x[3] + x[2] * x[4])
# 4 reads, 2 writes
@. Y = foo(X)
```

This is not always better:

 - The memory layout and the code had to change, which can be very difficult
   in a large codebase.
 - Memory access of `X` and `Y` is now strided, which can be slower than a
   single loop over contiguous arrays.

Ideally, the loops would be fused while keeping the original layout:

```julia
# 2 writes, 4 unique reads. The compiler can hoist the redundant memory reads here.
for i in eachindex(x1,x2,x3,x4,y1,y2)
  y1[i] = x1[i] * x2[i] + x3[i] * x4[i]
  y2[i] = x1[i] * x3[i] + x2[i] * x4[i]
end
```

## Defining a fused broadcast

LazyBroadcast provides the pieces to build such a loop for your own array
types. [`@make_type`](@ref LazyBroadcast.@make_type) defines a type that holds
a tuple of `destination => broadcasted` pairs, and
[`@make_fused`](@ref LazyBroadcast.@make_fused) defines a macro that collects
the `@.` expressions in a block into that type and calls `Base.copyto!` on it.
You define `Base.copyto!` for your type:

```julia
import LazyBroadcast: @make_type, @make_fused, fused_direct

@make_type MyFusedBroadcast
@make_fused fused_direct MyFusedBroadcast my_fused

@inline copy_at!(pairs::Tuple{}, I) = nothing
@inline function copy_at!(pairs::Tuple, I)
    p = first(pairs)
    p.first[I] = p.second[I]
    copy_at!(Base.tail(pairs), I)
end

function Base.copyto!(fmb::MyFusedBroadcast)
    pairs = map(fmb.pairs) do p
        p.first => Base.Broadcast.instantiate(p.second)
    end
    @inbounds for I in CartesianIndices(axes(first(pairs).first))
        copy_at!(pairs, I)
    end
    return nothing
end

@my_fused begin
  @. y1 = x1 * x2 + x3 * x4
  @. y2 = x1 * x3 + x2 * x4
end
```

ClimaCore's `Fields.@fused_direct` is built this way.

[`fused_direct`](@ref LazyBroadcast.fused_direct) accepts only a flat block of
`@.` assignments. [`fused_assemble`](@ref LazyBroadcast.fused_assemble) also
accepts `for` loops and `if` statements, and builds the tuple of pairs at run
time.

## Writing custom macros

`fused_direct` can also be called directly from a macro:

```julia
import LazyBroadcast: fused_direct

struct FusedMultiBroadcast{T}
    pairs::T
end
macro get_fused_multi_broadcast(expr)
    _pairs = gensym()
    quote
        $_pairs = $(esc(fused_direct(expr)))
        FusedMultiBroadcast($_pairs)
    end
end
```

This can be helpful for inspecting fused broadcast objects.

# LazyBroadcast.jl

LazyBroadcast.jl provides a macro, `LazyBroadcast.@lazy_broadcasted` to
transform a given Julia broadcast expression into a
`Base.Broadcast.Broadcasted` object, without materializing it.

For more information about Julia broadcasting, please see https://docs.julialang.org/en/v1/manual/arrays/#Broadcasting.

This utility is useful in a few situations:

 - Debugging broadcast machinery
 - Fusing operations in multiple broadcast expressions (e.g., see [MultiBroadcastFusion.jl](https://github.com/CliMA/MultiBroadcastFusion.jl), which has lots of overlapping infrastructure)
 - Delaying execution of a broadcast expression


For not-in-place expressions, `@lazy_broadcasted` simply
returns the broadcasted object, via `Base.Broadcast.broadcasted`
of the right-hand-side:

```julia
using Test
import LazyBroadcast: @lazy_broadcasted

a = rand(3,3)
b = rand(3,3)

@testset "lazy_broadcasted" begin
    bc = @lazy_broadcasted @. a + b # get the broadcasted object
    @test Base.broadcasted(+, a, b) == @lazy_broadcasted @. a + b
    @test Base.Broadcast.materialize(bc) == @. a + b # materialize the broadcasted object
end
```

For in-place expressions, `@lazy_broadcasted` will strip out
the left-hand-side, and still return return the broadcasted object,
via `Base.Broadcast.broadcasted`, of the right-hand-side:

```julia
import LazyBroadcast: @lazy_broadcasted

a = rand(3,3)
b = rand(3,3)
L = rand(3,3)

bc = @lazy_broadcasted @. L = a + b # get the broadcasted object for
@test Base.broadcasted(+, a, b) == @lazy_broadcasted @. L = a + b
@test Base.Broadcast.materialize!(L, bc) == @. L = a + b # materialize the broadcasted object
```

To eagerly execute expressions, you may simply immediately
materialize the returned broadcasted object:

```julia
import LazyBroadcast: @lazy_broadcasted

a = rand(3,3)
b = rand(3,3)
L = rand(3,3)

@. L = a + b

# is exactly equivalent to

bc = @lazy_broadcasted @. L = a + b
Base.Broadcast.materialize!(L, bc)
```

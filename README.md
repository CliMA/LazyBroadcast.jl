# LazyBroadcast.jl

We believe that software should be

 - simple
 - unit tested
 - fast
 - granular

LazyBroadcast.jl helps us achieve via [`lazy_broadcast`]
(@ref LazyBroadcast.lazy_broadcast). See our [documentation]
(https://clima.github.io/LazyBroadcast.jl/dev/) for a more in-depth dive into
how it works.

## Acknowledgement

The original implementation of `LazyBroadcast` involved a similar recipe to
`MultiBroadcastFusion`, which has different yet justified needs for its
implementation. Since then, [DontMaterialize.jl](https://github.com/MasonProtter/DontMaterialize.jl) was developed, which
satisfied most needs by LazyBroadcast using a significantly more elegant approach, discussed [here](https://github.com/CliMA/LazyBroadcast.jl/issues/14). So, we've borrowed that
implementation in order to be more consistent with `Base.Broadcast` semantics,
and provide users with less surprising behavior. We've also kept `code_lowered_single_expression`, as this is one feature that `DontMaterialize.jl` does not offer (transforming broadcasted `Expr` to `Expr`).


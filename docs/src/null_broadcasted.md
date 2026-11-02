# NullBroadcasted

[`NullBroadcasted()`](@ref LazyBroadcast.NullBroadcasted) can be added to,
subtracted from, or multiplied by any value in a broadcast expression without
incurring a runtime performance penalty. A function that computes an optional
term can return `NullBroadcasted()` when the term is turned off, and the caller
can add the result without checking.

```julia
using LazyBroadcast: NullBroadcasted
using Test

x = [1]; y = [1]
a = NullBroadcasted()
@. x = x + a + y
@test x[1] == 2 # passes

x = [1]; y = [1]
@. x = x - a + y
@test x[1] == 2 # passes

@. x = x + (x * a) # equivalent to @. x = x

@. x = x * a # not allowed, errors
@. x = a # not allowed, errors
```

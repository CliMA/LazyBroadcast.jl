# Motivation

[`lazy_broadcast`](@ref LazyBroadcast.lazy_broadcast) is useful in a few
situations:

 - Improved expressibility + fusing operations

 - Debugging broadcast machinery

 - Delaying execution of a broadcast expression

## Improved expressibility + fusing operations

You may have an implimentation of broadcast that involves a matrix-vector
multiplication, suppose we have two operators, `foo_op` and `bar_op`

```julia
has_foo_model && @. x += 2 * foo_op(y)
has_bar_model && @. x += 3 + bar_op(y)
```

and if `foo_op` and `bar_op` are broadcasted in an implementation-specific way,
you may not be able to (easily) write this to leverage dispatch:

```julia
foo(y, ::NoFooModel) = 0
foo(y, ::HasFooModel) = 2 * foo_op(y)
bar(y, ::NoBarModel) = 0
bar(y, ::HasBarModel) = 3 + bar_op(y)
@. x += foo(y, model) + bar(y, model)
```

since `foo_op` and `bar_op` may need to exist in the broadcasted expression. It
turns out that this is pretty easy to do with LazyBroadcast:

```julia
foo(y, ::NoFooModel) = 0
foo(y, ::HasFooModel) = @lazy @. 2 * foo_op(y)
bar(y, ::NoBarModel) = 0
bar(y, ::HasBarModel) = @lazy @. 3 + bar_op(y)
@. x += foo(y, model) + bar(y, model)
```

This form has some advantages:

 - we've fused the reads of vectors `x` and `y`, which can result in notably better performance
 - we've not duplicated logic (much). We could potentially use union splitting to achieve fusion, but this can become unwieldy as the number of combinations of cases increases.
 - the new functions would be in functional form, and more easily unit-tested

## Debugging broadcast machinery

If you overload Julia's broadcast software layer, then you may find yourself
constructing broadcast objects and working with them to write unit test on your
overloaded implementation of broadcast. We've often found it more convenient to
construct `Base.Broadcasted` objects using the standard dot-syntax +
LazyBroadcast. Here is an example, instead of writing:

```julia
x = [1, 2]
y = [1, 2]
a = Base.Broadcast.instantiate
(Base.Broadcast.broadcasted(+ x, y))
```

You can write

```julia
using
LazyBroadcast: lazy_broadcast
x = [1, 2]
y = [1, 2]
a = lazy_broadcast.(x .+ y)
```

which is typically the more common form that broadcast expressions exist in
applications.

## Delaying execution of a broadcast expression

Another interesting use-case of LazyBroadcast is to use it for delaying
execution.

For example, we can write an expression:

```@example delay
using LazyBroadcast: lazy_broadcast
a = [0, 0]
b = [0, 0]
c = lazy_broadcast.(a .+ b)
nothing
```

Perform calculations

```@example delay
a .= [1, 1]
b .= [1, 1]
nothing
```

And then finally evaluate the expression:

```@example delay
Base.materialize(c)
```

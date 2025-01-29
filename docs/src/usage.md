# Usage

If you've not read the [Julia Base Broadcast Background](@ref) section, that may
be helpful in understanding concepts, types, and functions discussed here.

The basic usage of this package involves wrapping intermediate broadcast
expressions with dot-calls to `lazy_broadcast`, and then working with those
resulting objects. Let's make one now.

```@example usage
using LazyBroadcast;
x = rand(10);
y_lazy = lazy_broadcast.(x .+ x);
```

As you can see, `y_lazy` is a `Broadcasted` object. There are several things
that you can do with them:
 
 - `materialize` them (which executes the expression)
 - Combine with other broadcast expressions
 - Call functions that support `Broadcasted` objects

Let's try each of these.

## Materialize

_Materializing_ consists in evaluating a `Broadcasted` object: when you materialize an object, you execute the expression and get the result back. To materialize an expression, we call `Base.Broadcast.materialize`

```@example usage
y_array = Base.Broadcast.materialize(y_lazy)
```
Or, we can call the in-place version, `Base.Broadcast.materialize!`:

```@example usage
z_array = similar(x)
Base.Broadcast.materialize!(z_array, y_lazy)
z_array
```
Let's take a second to reflect on what we did here: starting from an array (`x`), we created an unevaluated expression that manipulates that array (`y_lazy`, representing `x .+ x`), and we deferred the evaluation of that array to a later time.

We can take this to a step further: after we create `y_lazy`, we can manipulate it and combine it with other `Broadcasted` expression, deferring the evaluation of the full expression to a later time. This opens up a new world of possibilities and optimizations. Let us explore them in the next section.

## Combine with other broadcast expressions

This is as simple as combining expressions with more dot operations:

```@example usage
z_lazy = lazy_broadcast.(x .* x);
fused_lazy = y_lazy .+ z_lazy # Equivalent to `x .+ x .+ x .* x`
```

In this combined expression, `y_lazy .+ z_lazy` is equivalent to `x .+ x .+ x .*
x`, which means that this entire expression is fused. If we want to further
delay execution, we can wrap the entire result in a dot-`lazy_broadcast` call:

```@example usage
so_lazy = lazy_broadcast.(y_lazy .+ z_lazy)
```
Now, we have a `Broadcasted` object again.

Note that manipulating `Broadcasted` objects is very cheap, so `LazyBroadcast` allows you to construct a complex expression that can be evaluated more efficiently later.

## Call functions that support `Broadcasted`

Several functions in Julia Base directly support operations on `Broadcasted` objects.
For example, `sum`:

```@example usage
sum(so_lazy)
```
As we can see, this is equivalent to first evaluating the `Broadcasted` expression and then calling `sum` on the result.
Another common one is `Base.copyto!`, which can be called naturally through
broadcast expressions (`@.` -> `materialize!` -> `copyto!`, see
[Julia Base Broadcast Background](@ref) for details):

```@example usage
my_array = similar(x)
@. my_array = so_lazy
```

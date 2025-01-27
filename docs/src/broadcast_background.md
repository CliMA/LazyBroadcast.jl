# Julia Base Broadcast Background

Here, we'll provide our own brief background of Julia Base's broadcast
machinery. Please see the official Julia [broadcasting documentation]
(https://docs.julialang.org/en/v1/manual/arrays/#Broadcasting), for more
information.

## Introduction

Sometimes, you need to perform operations on arrays of different sizes, like
adding a vector to each column of a matrix. One inefficient approach would be
to expand the vector to match the matrix size:

```julia
julia> a = rand(2, 1); A = rand(2, 3);

julia> repeat(a, 1, 3) + A
2×3 Array{Float64,2}:
 1.20813  1.82068  1.25387
 1.56851  1.86401  1.67846
```

This can be inefficient with large arrays, so Julia offers the broadcast
function. It automatically expands smaller dimensions in the arrays to match
the larger ones without using extra memory and applies the operation element by
element:

```julia
julia> broadcast(+, a, A)
2×3 Array{Float64,2}:
 1.20813  1.82068  1.25387
 1.56851  1.86401  1.67846

julia> b = rand(1,2)
1×2 Array{Float64,2}:
 0.867535  0.00457906

julia> broadcast(+, a, b)
2×2 Array{Float64,2}:
 1.71056  0.847604
 1.73659  0.873631
```

Operators like `.+` and `.*` are shorthand for broadcast calls (with the added
benefit of "fusing" the operations). The `broadcast!` function lets you specify
where to store the result (and you can use `.=` to do this in a similar fused
way). For example, `f.(args...)` is the same as `broadcast(f, args...)`,
offering a simpler syntax for broadcasting any function. Also, nested "dot
calls" like `f.(g.(h.(args...)))` automatically fuse into a single broadcast
call.

Broadcasting isn't limited to arrays — it also works with scalars, tuples, and
other collections. By default, only certain types are treated as scalars, such
as `Number`s, `String`s, `Symbol`s, `Type`s, `Function`s, and common singletons
like `missing` and `nothing`. Other types are treated element by element.

```julia
julia> convert.(Float32, [1, 2])
2-element Vector{Float32}:
 1.0
 2.0

julia> ceil.(UInt8, [1.2 3.4; 5.6 6.7])
2×2 Matrix{UInt8}:
 0x02  0x04
 0x06  0x07

julia> string.(1:3, ". ", ["First", "Second", "Third"])
3-element Vector{String}:
 "1. First"
 "2. Second"
 "3. Third"
```

If you want to prevent a container (like an array) from being iterated over
during broadcasting, you can wrap it in another container (like a
single-element `Tuple`). This will make it behave as a single value during the
broadcast.

```julia
julia> ([1, 2, 3], [4, 5, 6]) .+ ([1, 2, 3],)
([2, 4, 6], [5, 7, 9])

julia> ([1, 2, 3], [4, 5, 6]) .+ tuple([1, 2, 3])
([2, 4, 6], [5, 7, 9])
```

## `@.` syntax

Julia Base also provides a macro, `@.`, which converts every function call or
operator in `expr` into a "dot call" (e.g. convert `f(x)` to `f.(x)`), and
converts every assignment in `expr` to a "dot assignment" (e.g. convert `+=` to
`.+=`).

If you want to avoid adding dots for selected function calls in expr, splice
those function calls in with `$`. For example, `@. sqrt(abs($sort(x)))` is
equivalent to `sqrt.(abs.(sort(x)))` (no dot for sort).

## Important `Base.Broadcast` types and functions

There are some important types and functions that are helpful for understanding
Julia's broadcasting.

 - `Base.Broadcast.Broadcasted` (or just `Broadcasted`)
 - `Base.Broadcast.broadcasted` (or just `broadcasted`, please note the difference in capitalization)
 - `Base.Broadcast.instantiate` (or just `instantiate`)
 - `Base.Broadcast.materialize` (or just `materialize`)
 - `Base.Broadcast.materialize!` (or just `materialize!`)
 - `Base.Broadcast.copyto` (or just `copyto`)
 - `Base.Broadcast.copyto!` (or just `copyto!`)

For brevity, we'll use a suffix `(!)` to denote the functional or in-place
methods.

The default type in Julia Base's broadcast software layer is `Broadcasted`. This
is a "lazy" object that contains

 - `style`, used for [traits](https://en.wikipedia.org/wiki/Trait_(computer_programming)), or dispatch
 - `f`, the function to be broadcasted
 - `args`, the arguments to the function `f`
 - `axes`, the "shape" or "size" of the broadcasted object, when materialized

When broadcast expressions are _lowered_ (a step in the Julia compilation
procedure), they are lowered to `broadcasted` calls, which are then passed to
`materialize(!)`. For example:

```@example
a = [1]
Base.Meta.@lower @. a+=1
```

!!! note
    
    The result of `Base.Meta.@lower` is an intermediate representation (IR) of
    the given expression.

The responsibility of `broadcasted`, here, is to return `Broadcasted` objects.
This function allows users to overload `broadcasted` to return special types of
`Broadcasted` objects.


Finally, `materialize(!)` does two things:

 - Calls `instantiate`, which reconstructs a new `Broadcasted`
   object with the `axes` populated (by default it's populated with `nothing`).
 - Calls `copyto(!)`, which executes the broadcasted expression per element.

var documenterSearchIndex = {"docs":
[{"location":"motivation/#Motivation","page":"Motivation","title":"Motivation","text":"","category":"section"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"lazy_broadcast is useful in a few situations:","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"Improved expressibility + fusing operations\nDebugging broadcast machinery\nDelaying execution of a broadcast expression","category":"page"},{"location":"motivation/#Improved-expressibility-fusing-operations","page":"Motivation","title":"Improved expressibility + fusing operations","text":"","category":"section"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"You may have an implimentation of broadcast that involves a matrix-vector multiplication, suppose we have two operators, foo_op and bar_op","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"has_foo_model && @. x += 2 * foo_op(y)\nhas_bar_model && @. x += 3 + bar_op(y)","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"and if foo_op and bar_op are broadcasted in an implementation-specific way, you may not be able to (easily) write this to leverage dispatch:","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"foo(y, ::NoFooModel) = 0\nfoo(y, ::HasFooModel) = 2 * foo_op(y)\nbar(y, ::NoBarModel) = 0\nbar(y, ::HasBarModel) = 3 + bar_op(y)\n@. x += foo(y, model) + bar(y, model)","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"since foo_op and bar_op may need to exist in the broadcasted expression. It turns out that this is pretty easy to do with LazyBroadcast:","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"foo(y, ::NoFooModel) = 0\nfoo(y, ::HasFooModel) = @lazy @. 2 * foo_op(y)\nbar(y, ::NoBarModel) = 0\nbar(y, ::HasBarModel) = @lazy @. 3 + bar_op(y)\n@. x += foo(y, model) + bar(y, model)","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"This form has some advantages:","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"we've fused the reads of vectors x and y, which can result in notably better performance\nwe've not duplicated logic (much). We could potentially use union splitting to achieve fusion, but this can become unwieldy as the number of combinations of cases increases.\nthe new functions would be in functional form, and more easily unit-tested","category":"page"},{"location":"motivation/#Debugging-broadcast-machinery","page":"Motivation","title":"Debugging broadcast machinery","text":"","category":"section"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"If you overload Julia's broadcast software layer, then you may find yourself constructing broadcast objects and working with them to write unit test on your overloaded implementation of broadcast. We've often found it more convenient to construct Base.Broadcasted objects using the standard dot-syntax + LazyBroadcast. Here is an example, instead of writing:","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"x = [1, 2]\ny = [1, 2]\na = Base.Broadcast.instantiate\n(Base.Broadcast.broadcasted(+ x, y))","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"You can write","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"using\nLazyBroadcast: lazy_broadcast\nx = [1, 2]\ny = [1, 2]\na = lazy_broadcast.(x .+ y)","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"which is typically the more common form that broadcast expressions exist in applications.","category":"page"},{"location":"motivation/#Delaying-execution-of-a-broadcast-expression","page":"Motivation","title":"Delaying execution of a broadcast expression","text":"","category":"section"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"Another interesting use-case of LazyBroadcast is to use it for delaying execution.","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"For example, we can write an expression:","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"using LazyBroadcast: lazy_broadcast\na = [0, 0]\nb = [0, 0]\nc = lazy_broadcast.(a .+ b)\nnothing","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"Perform calculations","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"a .= [1, 1]\nb .= [1, 1]\nnothing","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"And then finally evaluate the expression:","category":"page"},{"location":"motivation/","page":"Motivation","title":"Motivation","text":"Base.materialize(c)","category":"page"},{"location":"references/#References","page":"References","title":"References","text":"","category":"section"},{"location":"references/","page":"References","title":"References","text":"","category":"page"},{"location":"api/#API","page":"API","title":"API","text":"","category":"section"},{"location":"api/#Featured-functions-and-macros","page":"API","title":"Featured functions and macros","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"LazyBroadcast defines two exported functions:","category":"page"},{"location":"api/","page":"API","title":"API","text":"lazy_broadcast - the main feature of LazyBroadcast, which turns broadcast expressions into lazy broadcasted objects.\n@lazy_broadcast - which allows users to call lazy_broadcast without parenthesis.","category":"page"},{"location":"api/","page":"API","title":"API","text":"and two un-exported functions (un-exported intentionally to avoid name collisions)","category":"page"},{"location":"api/","page":"API","title":"API","text":"lazy - an alias of lazy_broadcast\n@lazy - an alias of @lazy_broadcast","category":"page"},{"location":"api/#lazy_broadcast","page":"API","title":"lazy_broadcast","text":"","category":"section"},{"location":"api/","page":"API","title":"API","text":"LazyBroadcast.lazy_broadcast","category":"page"},{"location":"api/#LazyBroadcast.lazy_broadcast","page":"API","title":"LazyBroadcast.lazy_broadcast","text":"function lazy_broadcast end # exported\nconst lazy = lazy_broadcast # not exported\n\nThis function has no methods and is only meant to be used to consume a broadcast expression, causing it to not materialize, allowing it to be used in a lazy manner and be consumed later.\n\nFor example, consider the situation where one wants to break up a complicated broadcast expression into multiple steps, and then sum up all of the components:\n\njulia> using BenchmarkTools\n\njulia> function foo(x)\n           y = x .+ x\n           z = 2 .* y\n           sum(z)\n       end;\n\njulia> @btime foo(v) setup=(v=rand(10))\n  43.096 ns (2 allocations: 288 bytes)\n20.37839658590829\n\nThis is significantly slower than it needs to be because new arrays need to be allocated for y and z, and the data needs to be passed over multiple times because the broadcast kernels are not 'fused'.\n\nDontMaterialize gives a simple way to avoid these allocations and retain broadcast fusion:\n\njulia> using BenchmarkTools, LazyBroadcast\n\njulia> function foo_lazy(x)\n           y = lazy_broadcast.(x .+ x)\n           z = lazy_broadcast.(2 .* y)\n           sum(z)\n       end;\n\njulia> @btime foo_lazy(v) setup=(v=rand(10))\n  5.958 ns (0 allocations: 0 bytes)\n23.002907370961225\n\nthe result of a lazy_broadcast call can be collected into an array with the materialize function (re-exported here from Base.Broadcast):\n\njulia> lazy_broadcast.(2 .* [1,2,3])\nBroadcasted{Base.Broadcast.DefaultArrayStyle{1}}(*, (2, [1, 2, 3]))\n\njulia> materialize(ans)\n3-element Vector{Int64}:\n 2\n 4\n 6\n\n\n\n\n\n","category":"function"},{"location":"usage/#Usage","page":"Usage","title":"Usage","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"If you've not read the Julia Base Broadcast Background section, that may be helpful in understanding concepts, types, and functions discussed here.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"The basic usage of this package involves wrapping intermediate broadcast expressions with dot-calls to lazy_broadcast, and then working with those resulting objects. Let's make one now.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"using LazyBroadcast;\nx = rand(10);\ny_lazy = lazy_broadcast.(x .+ x);","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"As you can see, y_lazy is a Broadcasted object. There are several things that you can do with them:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"materialize them (which executes the expression)\nCombine with other broadcast expressions\nCall functions that support Broadcasted objects","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Let's try each of these.","category":"page"},{"location":"usage/#Materialize","page":"Usage","title":"Materialize","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Materializing consists in evaluating a Broadcasted object: when you materialize an object, you execute the expression and get the result back. To materialize an expression, we call Base.Broadcast.materialize","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"y_array = Base.Broadcast.materialize(y_lazy)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Or, we can call the in-place version, Base.Broadcast.materialize!:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"z_array = similar(x)\nBase.Broadcast.materialize!(z_array, y_lazy)\nz_array","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Let's take a second to reflect on what we did here: starting from an array (x), we created an unevaluated expression that manipulates that array (y_lazy, representing x .+ x), and we deferred the evaluation of that array to a later time.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"We can take this to a step further: after we create y_lazy, we can manipulate it and combine it with other Broadcasted expression, deferring the evaluation of the full expression to a later time. This opens up a new world of possibilities and optimizations. Let us explore them in the next section.","category":"page"},{"location":"usage/#Combine-with-other-broadcast-expressions","page":"Usage","title":"Combine with other broadcast expressions","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"This is as simple as combining expressions with more dot operations:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"z_lazy = lazy_broadcast.(x .* x);\nfused_lazy = y_lazy .+ z_lazy # Equivalent to `x .+ x .+ x .* x`","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"In this combined expression, y_lazy .+ z_lazy is equivalent to x .+ x .+ x .* x, which means that this entire expression is fused. If we want to further delay execution, we can wrap the entire result in a dot-lazy_broadcast call:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"so_lazy = lazy_broadcast.(y_lazy .+ z_lazy)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Now, we have a Broadcasted object again.","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"Note that manipulating Broadcasted objects is very cheap, so LazyBroadcast allows you to construct a complex expression that can be evaluated more efficiently later.","category":"page"},{"location":"usage/#Call-functions-that-support-Broadcasted","page":"Usage","title":"Call functions that support Broadcasted","text":"","category":"section"},{"location":"usage/","page":"Usage","title":"Usage","text":"Several functions in Julia Base directly support operations on Broadcasted objects. For example, sum:","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"sum(so_lazy)","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"As we can see, this is equivalent to first evaluating the Broadcasted expression and then calling sum on the result. Another common one is Base.copyto!, which can be called naturally through broadcast expressions (@. -> materialize! -> copyto!, see Julia Base Broadcast Background for details):","category":"page"},{"location":"usage/","page":"Usage","title":"Usage","text":"my_array = similar(x)\n@. my_array = so_lazy","category":"page"},{"location":"acknowledgements/#Acknowledgements","page":"Acknowledgements","title":"Acknowledgements","text":"","category":"section"},{"location":"acknowledgements/","page":"Acknowledgements","title":"Acknowledgements","text":"The original implementation of LazyBroadcast involved a similar recipe to MultiBroadcastFusion, which has different yet justified needs for its implementation. Since then,DontMaterialize.jl was developed, which satisfied most needs by LazyBroadcast using a significantly more elegant approach, discussed here. So, we've borrowed that implementation in order to be more consistent with Base.Broadcast semantics, and provide users with less surprising behavior. We've also kept code_lowered_single_expression, as this is one feature that DontMaterialize.jl does not offer (transforming broadcasted Expr to Expr).","category":"page"},{"location":"quick_start/#Quick-start","page":"Quick start","title":"Quick start","text":"","category":"section"},{"location":"quick_start/","page":"Quick start","title":"Quick start","text":"Suppose we want to sum a vector, which is the result of multiple broadcast expressions: y = x .+ x, z = 2 .* y, and, finally, sum(z). We might first write this as:","category":"page"},{"location":"quick_start/","page":"Quick start","title":"Quick start","text":"using Base.Broadcast: materialize\nusing LazyBroadcast: lazy_broadcast\nusing BenchmarkTools\n\nfunction foo(x)\n   y = x .+ x\n   z = 2 .* y\n   sum(z)\nend;\n\nprint(@btime foo(v) setup=(v=rand(10)))","category":"page"},{"location":"quick_start/","page":"Quick start","title":"Quick start","text":"As you can see, there are heap allocations, which are impacting performance. Now, let's use LazyBroadcast.jl's lazy_broadcast to eliminate the intermediate allocations:","category":"page"},{"location":"quick_start/","page":"Quick start","title":"Quick start","text":"function foo_lazy(x)\n   # use lazy_broadcast to avoid intermediate allocations\n   y = lazy_broadcast.(x .+ x)\n   z = lazy_broadcast.(2 .* y)\n   sum(z)\nend;\n\nprint(@btime foo_lazy(v) setup=(v=rand(10)))","category":"page"},{"location":"quick_start/","page":"Quick start","title":"Quick start","text":"On my computer, the benchmarks take 43.433 ns and 5.917 ns, respectively. So, using LazyBroadcast results in a 7x speedup. This demonstrates the power of using lazy_broadcast, which has allowed us to avoid temporary allocations.","category":"page"},{"location":"quick_start/","page":"Quick start","title":"Quick start","text":"If you're interested in the implementation, check out the Internals of how lazy_broadcast works section.","category":"page"},{"location":"caveats/#Caveats","page":"Caveats","title":"Caveats","text":"","category":"section"},{"location":"caveats/","page":"Caveats","title":"Caveats","text":"There are some caveats of working with lazy objects: the construction of broadcasted objects and their execution can become separated, requiring more thought.","category":"page"},{"location":"caveats/#Delayed-execution-can-be-confusing","page":"Caveats","title":"Delayed execution can be confusing","text":"","category":"section"},{"location":"caveats/","page":"Caveats","title":"Caveats","text":"For example:","category":"page"},{"location":"caveats/","page":"Caveats","title":"Caveats","text":"using LazyBroadcast: lazy_broadcast\na = [0, 0]\nb = [0, 0]\nc = lazy_broadcast.(a .+ b)\na .= [1, 1]\nb .= [1, 1]\nnothing","category":"page"},{"location":"caveats/","page":"Caveats","title":"Caveats","text":"What do you suppose that the result of Base.materialize(c) is now? Let's see:","category":"page"},{"location":"caveats/","page":"Caveats","title":"Caveats","text":"Base.materialize(c)","category":"page"},{"location":"caveats/","page":"Caveats","title":"Caveats","text":"Tada! c is a Base.Broadcasted object that holds pointers to the data a and b, so even though we've since mutated a and b after assigning c, materializing c will yield results for whatever values that a and b contain at that instant. This might be surprising at first, but it's also very powerful. We can think of c as an expression, that holds true for whatever values we put into a and b.","category":"page"},{"location":"caveats/#Compilation-time","page":"Caveats","title":"Compilation time","text":"","category":"section"},{"location":"caveats/","page":"Caveats","title":"Caveats","text":"Broadcasted objects are stack-allocated, and therefore increasingly large broadcast expressions may result in increased compilation times.","category":"page"},{"location":"broadcast_background/#Julia-Base-Broadcast-Background","page":"Broadcast background","title":"Julia Base Broadcast Background","text":"","category":"section"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Here, we'll provide our own brief background of Julia Base's broadcast machinery. Please see the official Julia broadcasting documentation and the 2017 blog post by Steven G. Johnson, for more information.","category":"page"},{"location":"broadcast_background/#Introduction","page":"Broadcast background","title":"Introduction","text":"","category":"section"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Sometimes, you need to perform operations on arrays of different sizes, like adding a vector to each column of a matrix. One inefficient approach would be to expand the vector to match the matrix size:","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"julia> a = rand(2, 1); A = rand(2, 3);\n\njulia> repeat(a, 1, 3) + A\n2×3 Array{Float64,2}:\n 1.20813  1.82068  1.25387\n 1.56851  1.86401  1.67846","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"This can be inefficient with large arrays, so Julia offers the broadcast function. It automatically expands smaller dimensions in the arrays to match the larger ones without using extra memory and applies the operation element by element:","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"julia> broadcast(+, a, A)\n2×3 Array{Float64,2}:\n 1.20813  1.82068  1.25387\n 1.56851  1.86401  1.67846\n\njulia> b = rand(1,2)\n1×2 Array{Float64,2}:\n 0.867535  0.00457906\n\njulia> broadcast(+, a, b)\n2×2 Array{Float64,2}:\n 1.71056  0.847604\n 1.73659  0.873631","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Operators like .+ and .* are shorthand for broadcast calls (with the added benefit of \"fusing\" the operations). The broadcast! function lets you specify where to store the result (and you can use .= to do this in a similar fused way). For example, f.(args...) is the same as broadcast(f, args...), offering a simpler syntax for broadcasting any function. Also, nested \"dot calls\" like f.(g.(h.(args...))) automatically fuse into a single broadcast call.","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Broadcasting isn't limited to arrays — it also works with scalars, tuples, and other collections. By default, only certain types are treated as scalars, such as Numbers, Strings, Symbols, Types, Functions, and common singletons like missing and nothing. Other types are treated element by element.","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"julia> convert.(Float32, [1, 2])\n2-element Vector{Float32}:\n 1.0\n 2.0\n\njulia> ceil.(UInt8, [1.2 3.4; 5.6 6.7])\n2×2 Matrix{UInt8}:\n 0x02  0x04\n 0x06  0x07\n\njulia> string.(1:3, \". \", [\"First\", \"Second\", \"Third\"])\n3-element Vector{String}:\n \"1. First\"\n \"2. Second\"\n \"3. Third\"","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"If you want to prevent a container (like an array) from being iterated over during broadcasting, you can wrap it in another container (like a single-element Tuple). This will make it behave as a single value during the broadcast.","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"julia> ([1, 2, 3], [4, 5, 6]) .+ ([1, 2, 3],)\n([2, 4, 6], [5, 7, 9])\n\njulia> ([1, 2, 3], [4, 5, 6]) .+ tuple([1, 2, 3])\n([2, 4, 6], [5, 7, 9])","category":"page"},{"location":"broadcast_background/#@.-syntax","page":"Broadcast background","title":"@. syntax","text":"","category":"section"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Julia Base also provides a macro, @., which converts every function call or operator in expr into a \"dot call\" (e.g. convert f(x) to f.(x)), and converts every assignment in expr to a \"dot assignment\" (e.g. convert += to .+=).","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"If you want to avoid adding dots for selected function calls in expr, splice those function calls in with $. For example, @. sqrt(abs($sort(x))) is equivalent to sqrt.(abs.(sort(x))) (no dot for sort).","category":"page"},{"location":"broadcast_background/#Important-Base.Broadcast-types-and-functions","page":"Broadcast background","title":"Important Base.Broadcast types and functions","text":"","category":"section"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"There are some important types and functions that are helpful for understanding Julia's broadcasting.","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Base.Broadcast.Broadcasted (or just Broadcasted)\nBase.Broadcast.broadcasted (or just broadcasted, please note the difference in capitalization)\nBase.Broadcast.instantiate (or just instantiate)\nBase.Broadcast.materialize (or just materialize)\nBase.Broadcast.materialize! (or just materialize!)\nBase.Broadcast.copyto (or just copyto)\nBase.Broadcast.copyto! (or just copyto!)","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"For brevity, we'll use a suffix (!) to denote the functional or in-place methods.","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"The default type in Julia Base's broadcast software layer is Broadcasted. This is a \"lazy\" object that contains","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"style, used for traits, or dispatch\nf, the function to be broadcasted\nargs, the arguments to the function f\naxes, the \"shape\" or \"size\" of the broadcasted object, when materialized","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"When broadcast expressions are lowered (a step in the Julia compilation procedure), they are lowered to broadcasted calls, which are then passed to materialize(!). For example:","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"a = [1]\nBase.Meta.@lower @. a+=1","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"note: Note\nBase.Meta.@lower returns an intermediate representation (IR) of the given expression, which is printed as a sequence of operations where results of functions are assigned to symbols on the left-hand-side and later referenced.","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"The responsibility of broadcasted, here, is to return Broadcasted objects. This function allows users to overload broadcasted to return special types of Broadcasted objects.","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Finally, materialize(!) does two things:","category":"page"},{"location":"broadcast_background/","page":"Broadcast background","title":"Broadcast background","text":"Calls instantiate, which reconstructs a new Broadcasted object with the axes populated (by default it's populated with nothing).\nCalls copyto(!), which executes the broadcasted expression per element.","category":"page"},{"location":"how_it_works/#Internals-of-how-lazy_broadcast-works","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"","category":"section"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"We recommend reading reading Julia Base Broadcast Background before this section.","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"The entire implementation of LazyBroadcast is very short, and can be written in a few lines of code:","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"using Base.Broadcast: broadcasted, materialize, instantiate\nfunction lazy_broadcast end\nstruct LazyBroadcasted{T}\n    value::T\nend\nBase.Broadcast.broadcasted(::typeof(lazy_broadcast), x) = LazyBroadcasted(x)\nBase.materialize(x::LazyBroadcasted) = instantiate(x.value)","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"Let's break down how this works with a simple example:","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"x = [1, 2]\ny = [1, 2]\nz = x .+ y","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"First, the code is lowered, and we can see what the code is lowered to using Julia's meta-programming utilities:","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"julia> Meta.@lower(x .+ y)\n:($(Expr(:thunk, CodeInfo(\n    @ none within `top-level scope`\n1 ─ %1 = Base.broadcasted(+, x, y)\n│   %2 = Base.materialize(%1)\n└──      return %2\n))))","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"Now, you can see that our expression is transformed into a CodeInfo object, which contains a sequence of steps. If we back-substitute these expressions, we get Base.materialize(Base.broadcasted(+, x, y)), which is exactly what LazyBroadcast.code_lowered_single_expression(:(x .+ y)) returns:","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"julia> LazyBroadcast.code_lowered_single_expression(:(x .+ y))\n:(Base.materialize(Base.broadcasted(+, x, y)))","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"Note that Base.materialize calls Base.Broadcast.instantiate on the input argument, so let's take a look at the instantiated argument to Base.materialize:","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"julia> Base.Broadcast.instantiate(Base.broadcasted(+, x, y))\nBase.Broadcast.Broadcasted{Base.Broadcast.DefaultArrayStyle{1}}(+, ([1, 2], [1, 2]))","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"Here's where the magic comes in. Looking back at the implementation from above, we know that","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"When we broadcast lazy_broadcast over an expression x, Base.broadcasted returns LazyBroadcasted(expr), and\nBase.materialize(::LazyBroadcast) simply returns x","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"So, the result is:","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"julia> bc = LazyBroadcast.lazy_broadcast.(x .+ y)\nBase.Broadcast.Broadcasted{Base.Broadcast.DefaultArrayStyle{1}}(+, ([1, 2], [1, 2]))","category":"page"},{"location":"how_it_works/","page":"Internals of how lazy_broadcast works","title":"Internals of how lazy_broadcast works","text":"In other words, we get back the instantiated argument to Base.materialize. What's important to note here is that no computations occur until Base.materialize, so LazyBroadcast.lazy_broadcast.(x .+ y) returns a \"lazy\" object (a Base.Broadcasted object) that we can launch computations on, at any moment, by calling Base.materialize(bc).","category":"page"},{"location":"#LazyBroadcast.jl","page":"Home","title":"LazyBroadcast.jl","text":"","category":"section"},{"location":"","page":"Home","title":"Home","text":"The goal of this package is to help users write faster and more unit-test-friendly code, by avoiding temporary allocations, fusing operations, and enabling a more functional-programming design with Julia's broadcasting.","category":"page"},{"location":"","page":"Home","title":"Home","text":"This is achieved via lazy_broadcast. lazy_broadcast.","category":"page"},{"location":"","page":"Home","title":"Home","text":"To try this out, see our Quick start, or see how this works in the Internals of how lazy_broadcast works section.","category":"page"}]
}

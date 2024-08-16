wrap_bce(e) = :(Base.Broadcast.broadcasted(identity, $e))
materialize_args(s::Symbol) = (wrap_bce(s), wrap_bce(s))
function materialize_args(expr::Expr)
    @assert expr.head == :call
    if expr.args[1] == :(Base.materialize!)
        return (expr.args[2], expr.args[3])
    elseif expr.args[1] == :(Base.materialize)
        return (expr.args[2], expr.args[2]) # for type-stability, we always return a 2-tuple
    else
        return (wrap_bce(expr), wrap_bce(expr))
    end
end

function check_restrictions(expr)
    s_error = if expr isa QuoteNode
        "Dangling symbols are not allowed inside"
    elseif expr.head == :for
        "Loops are not allowed inside"
    elseif expr.head == :if
        "If-statements are not allowed inside"
    elseif expr.head == :call && !(isa_dot_op(expr.args[1]))
        "Function calls are not allowed inside"
    elseif expr.head == :(=)
        "Non-broadcast assignments are not allowed inside"
    elseif expr.head == :let
        "Let-blocks are not allowed inside"
    elseif expr.head == :quote
        "Quotes are not allowed inside"
    else
        ""
    end
    isempty(s_error) || error(s_error)
    if expr.head == :macrocall && expr.args[1] == Symbol("@__dot__")
    elseif expr.head == :block
        for arg in expr.args
            arg isa LineNumberNode && continue
            arg isa Symbol && continue
            check_restrictions(arg)
        end
    elseif expr.head == :call && isa_dot_op(expr.args[1])
        # Allows for LB.lazy_broadcasted(:(a .+ foo(b)))
        # where foo(b) could be a getter to an array.
        # This technically opens the door to incorrectness,
        # as foo could change the pointer of `b` to something else
        # however, this seems unlikely.
    elseif expr.head == Symbol(".") # dot function call
    elseif expr.head == Symbol(".=") # dot = expr
    else
        @show dump(expr)
        error("Uncaught edge case")
    end
end

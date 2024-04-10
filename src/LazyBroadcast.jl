module LazyBroadcast

function materialize_args(expr::Expr)
    @assert expr.head == :call
    if expr.args[1] == :(Base.materialize!)
        return (expr.args[2], expr.args[3])
    elseif expr.args[1] == :(Base.materialize)
        return (expr.args[2], expr.args[2])
    else
        error("Uncaught edge case.")
    end
end

function strip_materialize(expr::Expr)
    # @assert expr.head == :block
    exprs_out = []
    _expr = expr
    # TODO: should we retain LineNumberNode?
    # if _expr isa Symbol # ????????
    #     error("???")
    #     return ""
    # end
    # if _expr isa QuoteNode
    #     error("Dangling symbols are not allowed inside fused blocks")
    # end
    # _expr isa LineNumberNode && continue
    if _expr.head == :for
        error("Loops are not allowed inside")
    elseif _expr.head == :if
        error("If-statements are not allowed inside")
    elseif _expr.head == :call
        error("Function calls are not allowed inside")
    elseif _expr.head == :(=)
        error("Non-broadcast assignments are not allowed inside")
    elseif _expr.head == :let
        error("Let-blocks are not allowed inside")
    elseif _expr.head == :quote
        error("Quotes are not allowed inside")
    end
    if _expr.head == :macrocall && _expr.args[1] == Symbol("@__dot__")
        se = code_lowered_single_expression(_expr)
        margs = materialize_args(se)
        # push!(exprs_out, :(Pair($(margs[1]), $(margs[2]))))
        push!(exprs_out, :($(margs[2])))
    else
        @show dump(_expr)
        @show dump(expr)
        error("Uncaught edge case")
    end
    if length(exprs_out) == 1
        return "$(exprs_out[1])"
    else
        error("undexpected result")
    end
end

# General case: do nothing (identity)
substitute(x, code) = x
substitute(x::Core.SSAValue, code) = substitute(code[x.id], code)
substitute(x::Core.ReturnNode, code) = substitute(code[x.val.id], code)
substitute(s::Symbol, code) = s
# Expression: recursively substitute for Expr
substitute(e::Expr, code) =
    Expr(substitute(e.head, code), substitute.(e.args, Ref(code))...)

code_info(expr) = Base.Meta.lower(Main, expr).args[1]
function code_lowered_single_expression(expr)
    code = code_info(expr).code # vector
    s = string(substitute(code[end], code))
    ps = Base.Meta.parse(s)
    return ps
end

lazy_broadcasted(expr) = Meta.parse(strip_materialize(expr))

macro lazy_broadcasted(expr)
    esc(Meta.parse(strip_materialize(expr)))
end

end # module LazyBroadcast

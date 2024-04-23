module LazyBroadcast

include("utils.jl")
include("code_lowered_single_expression.jl")

transform(x) = x
transform(s::Symbol) = s
# Expression: recursively transform for Expr
const dot_ops = (
    Symbol(".+"),
    Symbol(".-"),
    Symbol(".*"),
    Symbol("./"),
    Symbol(".="),
    Symbol(".=="),
    Symbol(".≠"),
    Symbol(".^"),
    Symbol(".!="),
    Symbol(".>"),
    Symbol(".<"),
    Symbol(".>="),
    Symbol(".<="),
    Symbol(".≤"),
    Symbol(".≥"),
)
isa_dot_op(op) = any(x -> op == x, dot_ops)
function transform(e::Expr)
    if e.head == :macrocall && e.args[1] == Symbol("@__dot__")
        se = code_lowered_single_expression(e)
        margs = materialize_args(se)
        subexpr = :($(margs[2]))
        subexpr
    elseif e.head == :call && isa_dot_op(e.args[1])
        se = code_lowered_single_expression(e)
        margs = materialize_args(se)
        subexpr = :($(margs[2]))
        subexpr
    else
        Expr(transform(e.head), transform.(e.args)...)
    end
end

function _lazy_broadcasted(expr::Expr)
    check_restrictions(expr)
    return transform(expr)
end

lazy_broadcasted(expr) = _lazy_broadcasted(expr)

macro lazy_broadcasted(expr)
    esc(_lazy_broadcasted(expr))
end

end # module LazyBroadcast

#=
using Revise; include(joinpath("test", "fusion", "expr_materialize_args.jl"))
=#
using Test
import LazyBroadcast as LB

@testset "materialize_args" begin
    expr_in = :(Base.materialize!(y1, Base.broadcasted(+, x1, x2, x3, x4)))
    tuple_out = (:(y1), :(Base.broadcasted(+, x1, x2, x3, x4)))
    @test LB.materialize_args(expr_in) == tuple_out
end

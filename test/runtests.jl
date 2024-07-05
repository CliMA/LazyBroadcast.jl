#=
julia --project
using Revise; include(joinpath("test", "runtests.jl"))
=#
using Test
using SafeTestsets

#! format: off
@safetestset "expr_code_lowered_single_expression" begin; @time include("expr_code_lowered_single_expression.jl"); end
@safetestset "expr_restrictions" begin; @time include("expr_restrictions.jl"); end
@safetestset "expr_materialize_args" begin; @time include("expr_materialize_args.jl"); end
@safetestset "lazy_broadcasted" begin; @time include("lazy_broadcasted.jl"); end
#! format: on

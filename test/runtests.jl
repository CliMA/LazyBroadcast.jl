#=
julia --project
using Revise; include(joinpath("test", "runtests.jl"))
=#
using Test
using SafeTestsets

#! format: off
@safetestset "expr_code_lowered_single_expression" begin; @time include("expr_code_lowered_single_expression.jl"); end
@safetestset "lazy_broadcast" begin; @time include("lazy_broadcast.jl"); end
@safetestset "null_broadcasted" begin; @time include("null_broadcasted.jl"); end
@safetestset "expr_materialize_args" begin; @time include(joinpath("fusion", "expr_materialize_args.jl")); end
@safetestset "expr_fused_direct" begin; @time include(joinpath("fusion", "expr_fused_direct.jl")); end
@safetestset "expr_fused_assemble" begin; @time include(joinpath("fusion", "expr_fused_assemble.jl")); end
@safetestset "expr_errors_and_edge_cases" begin; @time include(joinpath("fusion", "expr_errors_and_edge_cases.jl")); end
@safetestset "make_fused" begin; @time include(joinpath("fusion", "make_fused.jl")); end
@safetestset "aqua" begin; @time include("aqua.jl"); end
#! format: on

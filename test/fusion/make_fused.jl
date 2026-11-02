#=
julia --project
using Revise; include(joinpath("test", "fusion", "make_fused.jl"))
=#
using Test
import LazyBroadcast: @make_type, @make_fused, @make_get_fused, fused_direct

@make_type TestFusedBroadcast
@make_fused fused_direct TestFusedBroadcast fused
@make_get_fused fused_direct TestFusedBroadcast get_fused

function Base.copyto!(fmb::TestFusedBroadcast)
    pairs = map(fmb.pairs) do p
        p.first => Base.Broadcast.instantiate(p.second)
    end
    for I in CartesianIndices(axes(first(pairs).first))
        foreach(p -> (p.first[I] = p.second[I]), pairs)
    end
    return nothing
end

@testset "make_fused" begin
    x1, x2, x3, x4 = rand(3, 3), rand(3, 3), rand(3, 3), rand(3, 3)
    y1, y2 = zeros(3, 3), zeros(3, 3)
    @fused begin
        @. y1 = x1 * x2 + x3 * x4
        @. y2 = x1 * x3 + x2 * x4
    end
    @test y1 == (@. x1 * x2 + x3 * x4)
    @test y2 == (@. x1 * x3 + x2 * x4)
end

@testset "make_get_fused" begin
    x1 = rand(3, 3)
    y1, y2 = zeros(3, 3), zeros(3, 3)
    fmb = @get_fused begin
        @. y1 = x1
        @. y2 = 2 * x1
    end
    @test fmb isa TestFusedBroadcast
    @test map(p -> p.first, fmb.pairs) === (y1, y2)
    @test all(iszero, y1)
end

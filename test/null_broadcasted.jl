#=
julia --project
using Revise; include(joinpath("test", "null_broadcasted.jl"))
=#
using Test
using LazyBroadcast: NullBroadcasted, lazy
import Base.Broadcast: instantiate, materialize, Broadcasted, DefaultArrayStyle

@testset "NullBroadcasted" begin
    x = [1]
    a = NullBroadcasted()
    @test typeof(lazy.(x .+ a)) <: Broadcasted{
        DefaultArrayStyle{1},
        Tuple{Base.OneTo{Int64}},
        typeof(+),
        Tuple{Vector{Int64}},
    }
    @test typeof(lazy.(a .+ x)) <: Broadcasted{
        DefaultArrayStyle{1},
        Tuple{Base.OneTo{Int64}},
        typeof(+),
        Tuple{Vector{Int64}},
    }
    @test lazy.(a .* x) isa NullBroadcasted
    @test lazy.(a ./ x) isa NullBroadcasted

    # +
    @test materialize(lazy.(a .+ x .+ 1)) == [2]
    @test materialize(lazy.(a .+ 1 .+ x)) == [2]
    @test materialize(lazy.(1 .+ a .+ x)) == [2]
    @test materialize(lazy.(1 .+ x .+ a)) == [2]
    @test materialize(lazy.(x .+ a .+ x)) == [2]
    @test materialize(lazy.(x .+ a .+ x)) == [2]

    # -
    @test materialize(lazy.(a .- x .- 1)) == [-2]
    @test materialize(lazy.(a .- 1 .- x)) == [-2]
    @test materialize(lazy.(1 .- a .- x)) == [0]
    @test materialize(lazy.(1 .- x .- a)) == [0]
    @test materialize(lazy.(a .- a)) == NullBroadcasted()
    @test materialize(lazy.(1 .- 1 .+ a .- a)) == 0
    @test materialize(lazy.(x .- x .+ a .- a)) == [0]

    # *
    @test materialize(lazy.(a .* x .* 1)) == NullBroadcasted()
    @test materialize(lazy.(a .* 1 .* x)) == NullBroadcasted()
    @test materialize(lazy.(1 .* a .* x)) == NullBroadcasted()
    @test materialize(lazy.(1 .* x .* a)) == NullBroadcasted()
    @test materialize(lazy.(x .+ (x .* a))) == [1]
    @test materialize(lazy.(x .- (x .* a))) == [1]
    @test materialize(lazy.((x .* a) .+ x)) == [1]
    @test materialize(lazy.((x .* a) .- x)) == [-1]

    # /
    @test materialize(lazy.(a ./ x ./ 1)) == NullBroadcasted()
    @test materialize(lazy.(a ./ 1 ./ x)) == NullBroadcasted()
    @test materialize(lazy.(1 ./ a ./ x)) == NullBroadcasted()
    @test materialize(lazy.(1 ./ x ./ a)) == NullBroadcasted()

    @test_throws MethodError NullBroadcasted() + 1
    @test_throws MethodError NullBroadcasted() - 1
    @test_throws MethodError NullBroadcasted() * 1
    @test_throws MethodError NullBroadcasted() / 1

    @test materialize(NullBroadcasted()) isa NullBroadcasted

    @test_throws ErrorException("NullBroadcasted objects cannot be materialized.") @. x =
        x * a
    @test_throws ErrorException("NullBroadcasted objects cannot be materialized.") @. x = a
end

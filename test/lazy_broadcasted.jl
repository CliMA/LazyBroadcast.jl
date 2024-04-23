#=
julia --project
using Revise; include(joinpath("test", "lazy_broadcasted.jl"))
=#
using Test
import LazyBroadcast as LB

a = rand(3, 3)
b = rand(3, 3)


@testset "lazy_broadcasted" begin
    bce = LB.lazy_broadcasted(:(@. a + b))
    bco = LB.@lazy_broadcasted @. a + b
    @test bce == :(Base.broadcasted(+, a, b))
    @test bco == Base.broadcasted(+, a, b)

    bce = LB.lazy_broadcasted(:(a .+ b))
    bco = LB.@lazy_broadcasted a .+ b
    @test bce == :(Base.broadcasted(+, a, b))
    @test bco == Base.broadcasted(+, a, b)

    bce = LB.lazy_broadcasted(:(a .+ foo.(b)))
    @test bce == :(Base.broadcasted(+, a, Base.broadcasted(foo, b)))

    bce = LB.lazy_broadcasted(:(a .+ foo(b)))
    @test bce == :(Base.broadcasted(+, a, foo(b)))
end

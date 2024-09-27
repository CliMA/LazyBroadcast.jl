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


Base.@kwdef struct Foo{T}
    x::T
end
Base.Broadcast.broadcastable(x::Foo) = tuple(x)

@testset "edge cases" begin
    state = Foo(; x = 1)
    bce = LB.lazy_broadcasted(:(@. state.x))
    @test bce ==
          :(Base.Broadcast.broadcasted(identity, Base.getproperty(state, :x)))
    bco = LB.@lazy_broadcasted @. state.x
    @test bco ==
          Base.Broadcast.broadcasted(identity, Base.getproperty(state, :x))

    bce = LB.lazy_broadcasted(:(@. state))
    bco = LB.@lazy_broadcasted @. state
    @test bce == :(Base.Broadcast.broadcasted(identity, state))
    @test bco == Base.Broadcast.broadcasted(identity, state)

    a, b = [1], [2]
    bce = LB.lazy_broadcasted(:(a .= b))
    @test bce == :(Base.broadcasted(Base.identity, b))

    bce = LB.lazy_broadcasted(:(out .= x .+ foo(y) .+ bar.(z)))
    @test bce == :(Base.broadcasted(
        +,
        Base.broadcasted(+, x, foo(y)),
        Base.broadcasted(bar, z),
    ))
end

@testset "edge cases" begin
    state = (; x = 1)
    bce = LB.lazy_broadcasted(:(@. state.x))
    @test bce ==
          :(Base.Broadcast.broadcasted(identity, Base.getproperty(state, :x)))
    bco = LB.@lazy_broadcasted @. state.x
    @test bco ==
          Base.Broadcast.broadcasted(identity, Base.getproperty(state, :x))

    bce = LB.lazy_broadcasted(:(@. state))
    @test_throws ArgumentError(
        "broadcasting over dictionaries and `NamedTuple`s is reserved",
    ) LB.@lazy_broadcasted @. state
    @test bce == :(Base.Broadcast.broadcasted(identity, state))

    a, b = [1], [2]
    bce = LB.lazy_broadcasted(:(a .= b))
    @test bce == :(Base.broadcasted(Base.identity, b))

    bce = LB.lazy_broadcasted(:(out .= x .+ foo(y) .+ bar.(z)))
    @test bce == :(Base.broadcasted(
        +,
        Base.broadcasted(+, x, foo(y)),
        Base.broadcasted(bar, z),
    ))
end

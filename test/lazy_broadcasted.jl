using Test
import LazyBroadcast as LB

a = rand(3, 3)
b = rand(3, 3)

bce = LB.lazy_broadcasted(:(@. a + b))
bco = LB.@lazy_broadcasted @. a + b

@testset "lazy_broadcasted" begin
    @test bce == :(Base.broadcasted(+, a, b))
    @test bco == Base.broadcasted(+, a, b)
end

using Test
using Aqua
import LazyBroadcast

@testset "Aqua" begin
    Aqua.test_all(LazyBroadcast)
end

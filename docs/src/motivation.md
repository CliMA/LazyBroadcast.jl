# Motivation

This utility is useful in a few situations:

 - Debugging broadcast machinery

 - Fusing operations in multiple broadcast expressions (alternatively, see
   [MultiBroadcastFusion.jl](https://github.com/CliMA/MultiBroadcastFusion.jl))

 - Delaying execution of a broadcast expression

For not-in-place expressions, `lazy_broadcast` simply returns
the instantiated broadcasted object, via `Base.Broadcast.instantiate
(Base.Broadcast.broadcasted(x))`, of the right-hand-side:

## Debuggin broadcast machinery

## Fusing multiple broadcast expressions

## Delaying execution of a broadcast expression


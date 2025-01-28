# LazyBroadcast.jl

|||
|---------------------:|:----------------------------------------------|
| **Docs Build**       | [![docs build][docs-bld-img]][docs-bld-url]   |
| **Documentation**    | [![dev][docs-dev-img]][docs-dev-url]          |
| **GHA CI**           | [![gha ci][gha-ci-img]][gha-ci-url]           |
| **Code Coverage**    | [![codecov][codecov-img]][codecov-url]        |

[docs-bld-img]: https://github.com/CliMA/LazyBroadcast.jl/actions/workflows/Documentation.yml/badge.svg
[docs-bld-url]: https://github.com/CliMA/LazyBroadcast.jl/actions/workflows/Documentation.yml

[docs-dev-img]: https://img.shields.io/badge/docs-dev-blue.svg
[docs-dev-url]: https://CliMA.github.io/LazyBroadcast.jl/dev/

[gha-ci-img]: https://github.com/CliMA/LazyBroadcast.jl/actions/workflows/ci.yml/badge.svg
[gha-ci-url]: https://github.com/CliMA/LazyBroadcast.jl/actions/workflows/ci.yml

[codecov-img]: https://codecov.io/gh/CliMA/LazyBroadcast.jl/branch/main/graph/badge.svg
[codecov-url]: https://codecov.io/gh/CliMA/LazyBroadcast.jl

LazyBroadcast.jl provides tools to defer the execution of Julia broadcasted
expressions. This can be used to avoid temporary allocations, fuse operations,
and enable a even more functional-programming approaches to Julia packages.

This is achieved via [`lazy_broadcast`](https://clima.github.io/LazyBroadcast.jl/dev/api/#LazyBroadcast.lazy_broadcast).
See our [documentation](https://clima.github.io/LazyBroadcast.jl/dev/) for more
information.

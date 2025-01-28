import Documenter, DocumenterCitations
import LazyBroadcast

bib = DocumenterCitations.CitationBibliography(joinpath(@__DIR__, "refs.bib"))

mathengine = Documenter.MathJax(
    Dict(
        :TeX => Dict(
            :equationNumbers => Dict(:autoNumber => "AMS"),
            :Macros => Dict(),
        ),
    ),
)

format = Documenter.HTML(
    prettyurls = !isempty(get(ENV, "CI", "")),
    mathengine = mathengine,
    collapselevel = 1,
)

Documenter.makedocs(;
    plugins = [bib],
    sitename = "LazyBroadcast.jl",
    format = format,
    checkdocs = :exports,
    clean = true,
    doctest = true,
    modules = [LazyBroadcast],
    pages = Any[
        "Home" => "index.md",
        "Quick start" => "quick_start.md",
        "Usage" => "usage.md",
        "Broadcast background" => "broadcast_background.md",
        "Internals of how `lazy_broadcast` works" => "how_it_works.md",
        "Caveats" => "caveats.md",
        "Motivation" => "motivation.md",
        "API" => "api.md",
        "References" => "references.md",
        "Acknowledgements" => "acknowledgements.md",
    ],
)

Documenter.deploydocs(
    repo = "github.com/CliMA/LazyBroadcast.jl.git",
    target = "build",
    push_preview = true,
    devbranch = "main",
    forcepush = true,
)

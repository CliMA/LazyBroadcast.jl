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
        "Motivation" => "motivation.md",
        "Broadcast background" => "broadcast_background.md",
        "API" => "api.md",
        "References" => "references.md",
    ],
)

Documenter.deploydocs(
    repo = "github.com/CliMA/LazyBroadcast.jl.git",
    target = "build",
    push_preview = true,
    devbranch = "main",
    forcepush = true,
)

# Surfacing Mining (IN PROGRESS)

[![Explorer](https://img.shields.io/badge/explorer-live-brightgreen)](https://civic-interconnect.github.io/surfacing-mining/explorer/)
[![Docs](https://img.shields.io/badge/docs-GitHub%20Pages-blue)](https://civic-interconnect.github.io/surfacing-mining/)
[![CI Status](https://github.com/civic-interconnect/surfacing-mining/actions/workflows/ci-python-zensical.yml/badge.svg?branch=main)](https://github.com/civic-interconnect/surfacing-mining/actions/workflows/ci-python-zensical.yml)
[![Link Check](https://github.com/civic-interconnect/surfacing-mining/actions/workflows/links.yml/badge.svg?branch=main)](https://github.com/civic-interconnect/surfacing-mining/actions/workflows/links.yml)
[![Python 3.14+](https://img.shields.io/badge/python-3.14%2B-blue?logo=python)](#)
[![MIT](https://img.shields.io/badge/license-see%20LICENSE-yellow.svg)](./LICENSE)

> A data-driven framework for surfacing mining decisions, value flows, and distributions of local exposure, external value capture, and time-indexed costs.

## Scope

This repository models structural patterns in mining proposals and regions. It is not limited to a single company or a single project.

Current regional analyses:
- copper_sulfide_mn
- helium_mn

Current profiles:
- copper_sulfide_hardrock
- helium_gas

## Core design principle

General engine, profile-driven logic, project-specific data.

```text
project = profile + project_data + evidence + geospatial_layers
```

## Repository areas

```text
data/profiles/ - profile templates
data/projects/ - regional/project instances
data/shared/ - shared categories and conventions
docs/explorer/ - static public explorer
src/surfacing_mining/ - loaders, validators, exporters
```

## Contribution

The contribution of this project is the framework for structured exploration,
not the specific values used in any given evaluation.

- Constraints, thresholds, and weights are configurable
- Assumptions are explicit and inspectable
- Results are comparative and assumption-dependent

This project does not determine outcomes or recommend decisions.
It provides a way to examine how different assumptions and constraints shape outcomes.

## Working Files

Working files are found in these areas:

- **data/** - source inputs and configuration
- **docs/** - narrative
- **src/** - Python implementation

## Planned Capabilities

- Loads data from TOML files
- Exports results as JSON for the web Explorer
- Interactive web Explorer for non-technical users
- Planned ability to edit the data files via the Explorer (in your browser)

## Command Reference

<details>
<summary>Show command reference</summary>

### In a machine terminal (open in your `Repos` folder)

After you get a copy of this repo in your own GitHub account,
open a machine terminal in your `Repos` folder:

```shell
# Replace username with YOUR GitHub username.
git clone https://github.com/username/surfacing-mining

cd surfacing-mining
code .
```

### In a VS Code terminal

```shell
# Set Up the Environment
uv self update
uv python pin 3.14
uv sync --extra dev --extra docs --upgrade
uvx pre-commit install

# Local format + lint
uv run ruff format --check .
uv run ruff check .

# Pre-commit (enforce repo rules)
git add -A
uvx pre-commit run --all-files
# repeat if changes were made
git add -A
uvx pre-commit run --all-files

# Static + security + dependency checks
uv run validate-pyproject pyproject.toml
uv run deptry .
uv run bandit -c pyproject.toml -r src

# Tests (after static checks pass)
uv run pytest --cov=src --cov-report=term-missing

# Run (later)

# Docs build (after everything passes)
uv run zensical build

# Commit and push
git add -A
git commit -m "update"
git push -u origin main
```

</details>

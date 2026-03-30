# Glossary

This glossary defines the core terms used throughout the surfacing-mining project.
Terms are defined structurally and consistently across profiles, projects, data files,
and the explorer interface.

## Core Concepts

### Project

A **project** is a regional or contextual instance of analysis.

A project combines:

- a profile
- location-specific data
- value flows
- exposures
- evidence
- geospatial layers

Example:

- `copper_sulfide_mn`
- `helium_mn`

### Profile

A **profile** is a reusable structural pattern describing a class of extraction activity.

A profile defines:

- processing stages
- exposure categories
- value flow categories
- required and optional map layers
- time emphasis

Profiles are independent of any specific company or site.

Example:

- `copper_sulfide_hardrock`
- `helium_gas`

### Unit of Analysis

The unit of analysis is `profile + location`: a structural pattern applied to a specific region.

A single profile can be applied to multiple locations.
A single location can be analyzed under multiple profiles.
Results are always relative to the combination of both.

### Scope

**Scope** describes the analytical boundary of a project.

Current scope values:

- `regional pattern` — analysis of structural patterns across a region, not tied to a single operator or permit application

## Value and Cost Structures

### Value Flow

A **value flow** is a directional transfer of economic value associated with an extraction project.

Each value flow has:

- a direction (see [Flow Direction](#flow-direction))
- a recipient
- a local capture fraction
- a weight (relative importance within the project)
- a time horizon

Value flows are not uniformly positive.
A counterfactual loss (e.g., suppressed tourism revenue) is modeled as an outflow.

### Flow Direction

**Flow direction** describes where value moves relative to the local region.

| Direction | Meaning |
|||
| `inflow_to_region` | Value enters the local economy (wages, taxes, royalties) |
| `outflow_from_region` | Value leaves the region (commodity revenue to shareholders) |
| `inflow_variable` | Inflow whose amount is uncertain or contingent (royalties under negotiation) |
| `inflow_conditional` | Inflow that only materializes under specific conditions (reclamation bond draw) |
| `inflow_national` | Value accrues nationally rather than locally (strategic mineral supply) |
| `outflow_counterfactual` | Value that would have existed in the absence of the project (foregone tourism) |

### Local Capture Fraction

The **local capture fraction** is a qualitative estimate of how much of a value flow remains within the local region.

Values: `high`, `medium`, `low`, `negligible`, `negative`, or a descriptive phrase.

A high local capture fraction means most of the value
stays in the region (e.g., wages paid to local residents).
A low fraction means most value exits (e.g., commodity revenue to external shareholders).

### Weight

A **weight** is a configurable relative importance
assigned to a value flow or exposure within a project.

Weights are expressed as decimals summing to 1.0
across all flows (or across all exposures).

Weights are structural defaults from the profile.
They are not empirical measurements.
They should be treated as assumptions, not findings.

### Time Horizon

The **time horizon** of a value flow or exposure
describes the phase or duration over which it is active.

Common values:

- `construction` — bounded to the build phase
- `operational` — active during mine or facility operations
- `post-closure` — persists after operations end
- `permanent` / `perpetual` — no expected end date
- `multi-generational` — extends across decades or longer

Time horizon is one of the primary structural dimensions
for detecting asymmetry between bounded benefits and long-tail costs.

## Exposure

### Exposure

An **exposure** is a category of cost, risk, or
disruption borne by a local population, community, or ecosystem.

Each exposure has:

- a category (environmental, economic, fiscal, cultural/legal, quality of life)
- a local bearer
- a weight
- a time horizon
- a reversibility assessment

Exposures are local by definition.
They describe who bears what, for how long, and
how recoverable the impact is.

### Local Bearer

The **local bearer** is the population, community, or
entity that carries an exposure.

Examples:

- downstream municipalities
- tribal communities with treaty rights
- recreational outfitters
- regional taxpayers

### Reversibility

**Reversibility** describes whether an exposure
can be recovered from after the project ends.

| Value | Meaning |
|||
| `high` | Conditions return to baseline post-closure with standard remediation |
| `medium` | Partial recovery likely; some lasting change expected |
| `low` | Significant lasting impact; full recovery unlikely |
| `very low` | Effectively permanent under realistic scenarios |

### Temporal Asymmetry

**Temporal asymmetry** occurs when value flows are bounded
to the operational period while exposures extend into post-closure or are permanent.

This is a structural feature of many extraction projects:
revenue and employment end when operations cease,
but water treatment obligations, abandoned well liability,
or ecosystem impacts may persist indefinitely.

The explorer surfaces temporal asymmetry automatically when it is detected.

## Evidence

### Evidence

**Evidence** is the collection of sources, claims, and
documented gaps associated with a project.

Evidence is stored in `evidence.toml` and includes:

- regulatory sources (EIS documents, permit filings, agency rules)
- scientific and technical sources
- economic sources
- indigenous and legal sources
- known gaps

### Claim

A **claim** is a factual assertion associated with a
project that can be linked to one or more sources.

Claims are not conclusions.
They are traceable statements that can be inspected, challenged, or updated.

### Gap

A **gap** is an explicitly documented absence of evidence.

Gaps are first-class data.
Documenting what is unknown is as important as documenting what is known.

## Geospatial

### Geospatial Layer

A **geospatial layer** is a GeoJSON file associated
with a project that provides spatial context.

Standard layers:

| Layer | Description |
|||
| `site` | Project site footprint, wellpads, or lease area |
| `watershed` | Drainage sub-basins relevant to the project |
| `laurentian_divide` | Continental drainage divide (where applicable) |
| `downstream_path` | Modeled downstream drainage paths from the site |
| `protected_areas` | Wilderness, national forest, park, and state forest boundaries |

All geospatial layers in this project are structural
placeholders unless explicitly marked otherwise.
Replace with authoritative sources (USGS NHD, PADUS, USFS, MN DNR)
before drawing conclusions.

### Laurentian Divide

The **Laurentian Divide** is a continental drainage divide
in northern Minnesota separating two major drainage basins:

- **North** — drains to the Rainy River and Hudson Bay
- **South/East** — drains to Lake Superior and the St. Lawrence Seaway

The position of a project site relative to the
Laurentian Divide determines which downstream watershed(s)
bear water quality exposure.
Sites near the divide may drain to both basins.

### Downstream Path

A **downstream path** is the modeled drainage route
from a project site to a major receiving water body.

Downstream paths are used to identify communities, ecosystems, and
jurisdictions that may bear water quality or hydrological exposure from a project.

## Framework Terms

### Admissibility

**Admissibility** is whether a project or scenario passes
a defined set of hard constraints.

Admissibility is binary (pass / fail) and constraint-dependent.
A project that fails a constraint under one assumption set
may pass under another.
Admissibility is not approval or recommendation.

### Assumption Dependence

All results in this framework are **assumption-dependent**.

Weights, thresholds, and constraint values are configurable.
Changing assumptions changes results.
The framework is designed to make this dependence explicit and
inspectable.

### Structural Exploration

**Structural exploration** is the practice of examining
how different assumptions, constraints, and weightings shape outcomes
without asserting which outcome is correct.

This project is a tool for structural exploration.
It does not determine outcomes or recommend decisions.

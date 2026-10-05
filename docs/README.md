# S20 Documentation

Welcome to the documentation for **Spouse 2.0 (S20)**.

Documentation is generated and published in both Markdown and HTML formats:

- **[Markdown API Reference](./markdown/modules.md)**: Native GitHub markdown documentation,
  optimized for browsing directly within repository source viewers:
  - **[@s20/app API](./markdown/app/src/README.md)**: Application service layer, CSV storage engine,
    Temporal time math, duration parsing, and configuration defaults.
  - **[@s20/cli API](./markdown/cli/src/README.md)**: Lightweight schema-driven command engine,
    argument tokenizer, parameter coercion, and shell autocompletion.
  - **[@s20/csv API](./markdown/csv/src/README.md)**: RFC 4180 CSV parser, serializer, and file
    streaming library.
  - **[@s20/yaml API](./markdown/yaml/src/README.md)**: Embedded YAML parser and serializer for S20
    CLI configurations.
- **[HTML Documentation](./html/index.html)**: Interactive, searchable HTML documentation generated
  via TypeDoc.

---

## Architectural & Contributor Guides

- **[Developer Guide (DEVELOPER.md)](../DEVELOPER.md)**: System architecture diagrams, synchronization
  algorithms, directory layout, coding conventions, and developer workflows.
- **[Project Overview (README.md)](../README.md)**: Quick start guide, feature matrix, command
  reference, CSV formats, and programmatic usage examples.

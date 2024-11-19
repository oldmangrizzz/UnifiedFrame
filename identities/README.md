# Identity Files

This directory contains markdown files defining AI personas and their system prompts. Each identity file follows a structured format with YAML frontmatter for metadata and markdown sections for the detailed system prompt.

## File Structure

```
identities/
├── README.md
├── template.md
└── [character-name].md
```

## Creating New Identities

1. Copy `template.md` to create a new identity file
2. Name it appropriately (e.g., `red-hood.md`, `oracle.md`)
3. Fill in the frontmatter metadata
4. Add the detailed system prompt following the template structure

## Frontmatter Fields

- `name`: Character's full name
- `version`: Semantic version of the prompt
- `author`: Creator or organization
- `tags`: Relevant categories/traits
- `model`: Preferred AI model
- `trainingStatus`: Current training state
- `lastUpdated`: Last modification date

## Usage

Identity files are loaded dynamically by the framework's IdentityManager and can be referenced in AI requests using the identity's filename (without extension) as the ID.
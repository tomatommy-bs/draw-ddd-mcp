## ADDED Requirements

### Requirement: Reference click navigates to entity
The system SHALL navigate to and focus the corresponding entity on the canvas when the user clicks a structured reference (`[[R:名前]]` or `[[E:名前]]`) in the glossary sidebar.

#### Scenario: Click reference to navigate
- **WHEN** the user clicks "受注" rendered from `[[E:受注]]` in a term's definition
- **THEN** the canvas pans to center the "受注" entity and selects it

#### Scenario: Click broken reference
- **WHEN** the user clicks a broken reference (entity does not exist)
- **THEN** nothing happens (no navigation, no error)

### Requirement: Entity focus filters glossary
The system SHALL filter the glossary sidebar to show only related terms when an entity is focused on the canvas while the glossary sidebar is open.

#### Scenario: Focus entity shows related terms
- **WHEN** the glossary sidebar is open and the user selects entity "受注" on the canvas
- **THEN** the sidebar filters to show only terms where entityRef matches "受注" or definition contains `[[E:受注]]`

#### Scenario: Direct correspondence distinguished from mention
- **WHEN** the glossary is filtered by entity "受注"
- **THEN** terms with entityRef pointing to "受注" are marked with a ✦ indicator (direct correspondence), and terms that only mention `[[E:受注]]` in their definition are shown without the indicator

#### Scenario: Deselect entity clears filter
- **WHEN** the user deselects the entity (clicks canvas background)
- **THEN** the glossary sidebar returns to showing all terms

### Requirement: Search and entity filter coexist
The system SHALL apply both search text filter and entity focus filter simultaneously when both are active.

#### Scenario: Combined filter
- **WHEN** the entity "受注" is focused and the user types "リード" in the search box
- **THEN** only terms that match both filters are displayed (related to "受注" AND contain "リード")

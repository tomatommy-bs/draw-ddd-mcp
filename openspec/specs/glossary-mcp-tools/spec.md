## ADDED Requirements

### Requirement: tm_add_term MCP tool
The system SHALL provide a `tm_add_term` MCP tool that creates a new glossary term. Parameters:
- `name` (string, required)
- `definition` (string, required)
- `context` (string, optional)
- `rejected` (array of { term, reason }, optional)
- `entityRef` (string, optional) — entity name to look up and link by id

#### Scenario: Add term via MCP
- **WHEN** `tm_add_term` is called with name "受注" and definition "[[R:顧客]] が商品を注文し企業が受け付けた出来事"
- **THEN** the term is created in the GUI and the created term data is returned

#### Scenario: Add term with entity reference by name
- **WHEN** `tm_add_term` is called with entityRef "受注" and an event entity named "受注" exists
- **THEN** the term is created with entityRef set to that entity's id

#### Scenario: Add term with non-existent entity reference
- **WHEN** `tm_add_term` is called with entityRef "存在しない" and no entity with that name exists
- **THEN** the operation fails with an error indicating the entity was not found

### Requirement: tm_update_term MCP tool
The system SHALL provide a `tm_update_term` MCP tool that updates an existing glossary term. Parameters:
- `name` (string, required) — identifies the term to update (by current name)
- `newName` (string, optional)
- `definition` (string, optional)
- `context` (string, optional)
- `rejected` (array of { term, reason }, optional) — replaces the entire rejected list
- `entityRef` (string or null, optional) — entity name to look up, or null to unlink

#### Scenario: Update term definition
- **WHEN** `tm_update_term` is called with name "受注" and a new definition
- **THEN** the term's definition is updated and all other fields remain unchanged

#### Scenario: Rename a term
- **WHEN** `tm_update_term` is called with name "受注" and newName "注文受付"
- **THEN** the term's name is changed to "注文受付"

### Requirement: tm_delete_term MCP tool
The system SHALL provide a `tm_delete_term` MCP tool that deletes a glossary term by name.

#### Scenario: Delete term via MCP
- **WHEN** `tm_delete_term` is called with name "受注"
- **THEN** the term is removed from the glossary

#### Scenario: Delete non-existent term
- **WHEN** `tm_delete_term` is called with a name that does not exist
- **THEN** the operation fails with an error indicating the term was not found

### Requirement: tm_list_terms MCP tool
The system SHALL provide a `tm_list_terms` MCP tool that returns all glossary terms with their full data including resolved reference status.

#### Scenario: List terms via MCP
- **WHEN** `tm_list_terms` is called
- **THEN** all terms are returned with their id, name, definition, context, rejected, and entityRef fields

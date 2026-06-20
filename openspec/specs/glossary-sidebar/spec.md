## ADDED Requirements

### Requirement: Glossary sidebar panel
The system SHALL display a Glossary sidebar panel on the right side of the GUI, toggled by a dictionary icon button in the Toolbar.

#### Scenario: Open glossary sidebar
- **WHEN** the user clicks the glossary toggle button in the Toolbar
- **THEN** a Glossary sidebar panel appears on the right side showing all terms

#### Scenario: Close glossary sidebar
- **WHEN** the glossary sidebar is open and the user clicks the toggle button again
- **THEN** the sidebar closes

### Requirement: Term list display
The system SHALL display each term in the sidebar as a card showing the term name, a badge indicating direct entity correspondence (if entityRef is set), and the definition text with rendered references.

#### Scenario: Display term with entity reference
- **WHEN** a term has entityRef set and the corresponding entity exists
- **THEN** the term card shows a badge with the entity type (R or E) and name

#### Scenario: Display term without entity reference
- **WHEN** a term has entityRef as null
- **THEN** the term card shows no entity badge

### Requirement: Structured reference rendering
The system SHALL render `[[R:名前]]` and `[[E:名前]]` in definition text as styled, clickable inline elements. Resource references SHALL use blue styling and event references SHALL use yellow/amber styling, matching entity type colors.

#### Scenario: Render valid reference
- **WHEN** a definition contains `[[E:受注]]` and an event entity named "受注" exists
- **THEN** "受注" is rendered as a clickable element with event color styling

#### Scenario: Render broken reference
- **WHEN** a definition contains `[[E:出荷]]` and no entity named "出荷" exists
- **THEN** "出荷" is rendered with red color and strikethrough to indicate a broken reference

### Requirement: Term search
The system SHALL provide a search input at the top of the glossary sidebar that filters terms by name and definition text.

#### Scenario: Search filters terms
- **WHEN** the user types "受" in the search input
- **THEN** only terms whose name or definition contains "受" are displayed

#### Scenario: Empty search shows all
- **WHEN** the search input is cleared
- **THEN** all terms are displayed (subject to any active entity focus filter)

### Requirement: Add term from sidebar
The system SHALL provide an "add term" button in the glossary sidebar that opens an inline form to create a new term.

#### Scenario: Add term via sidebar form
- **WHEN** the user clicks the add button and fills in name and definition
- **THEN** a new term is created and appears in the term list

### Requirement: Edit term from sidebar
The system SHALL allow editing a term by clicking on it in the sidebar to expand an edit form.

#### Scenario: Edit term inline
- **WHEN** the user clicks a term card to edit
- **THEN** the term fields become editable inline and changes are saved on confirm

### Requirement: Delete term from sidebar
The system SHALL allow deleting a term from the sidebar with a confirmation step.

#### Scenario: Delete term with confirmation
- **WHEN** the user clicks delete on a term and confirms
- **THEN** the term is removed from the glossary

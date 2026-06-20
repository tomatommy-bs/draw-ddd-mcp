## ADDED Requirements

### Requirement: Term data structure
The system SHALL manage glossary terms with the following fields:
- `id`: unique identifier (nanoid)
- `name`: term name (string, required)
- `definition`: definition text containing optional structured references (string, required)
- `context`: usage context description (string, optional, defaults to empty)
- `rejected`: array of rejected alternative terms, each with `term` (string) and `reason` (string)
- `entityRef`: TM entity id that this term directly corresponds to (string or null)

#### Scenario: Create a term with all fields
- **WHEN** a term is created with name "受注", definition "[[R:顧客]] が [[R:商品]] を注文し企業が受け付けた出来事", context "営業チーム", rejected [{ term: "注文", reason: "顧客視点のため" }], entityRef pointing to an event entity
- **THEN** the term is stored with all fields and a generated id

#### Scenario: Create a term with minimal fields
- **WHEN** a term is created with only name "リードタイム" and definition "受注から出荷までの日数"
- **THEN** the term is stored with context as empty string, rejected as empty array, entityRef as null

### Requirement: Structured reference syntax
The system SHALL support `[[R:名前]]` and `[[E:名前]]` syntax in term definition text, where R denotes a resource entity and E denotes an event entity, and 名前 is the entity name.

#### Scenario: Parse references from definition text
- **WHEN** a definition contains "[[R:顧客]] が [[E:受注]] を行う"
- **THEN** the system identifies two references: resource "顧客" and event "受注"

#### Scenario: Definition with no references
- **WHEN** a definition contains "営業活動における初回接触のこと"
- **THEN** the system identifies zero references

### Requirement: Term CRUD operations
The system SHALL support adding, updating, deleting, and listing terms in the diagram state.

#### Scenario: Add a term
- **WHEN** a term is added with name "顧客" and definition "商品を注文する主体"
- **THEN** the term appears in the terms list with a unique id

#### Scenario: Update a term
- **WHEN** an existing term's name is changed from "受注" to "注文受付"
- **THEN** the term's name is updated and all other fields remain unchanged

#### Scenario: Delete a term
- **WHEN** a term is deleted by id
- **THEN** the term is removed from the terms list

#### Scenario: List all terms
- **WHEN** terms are listed
- **THEN** all current terms are returned

### Requirement: Term name uniqueness
The system SHALL NOT allow two terms with the same name (case-sensitive).

#### Scenario: Reject duplicate term name
- **WHEN** a term with name "顧客" already exists and another term with name "顧客" is added
- **THEN** the operation fails with an error indicating the name is already in use

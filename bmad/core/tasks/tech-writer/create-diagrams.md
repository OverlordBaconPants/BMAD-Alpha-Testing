<!-- Powered by BMAD-CORE™ -->

# Tech Writer: Create Technical Diagrams

```xml
<task id="bmad/core/tasks/tech-writer/create-diagrams.md" name="Create Technical Diagrams">
  <objective>Generate Mermaid diagrams for architecture, data flow, and component relationships</objective>

  <inputs critical="true">
    <input name="diagram_type" type="string" required="true" description="Type: architecture, sequence, flowchart, er-diagram, class-diagram, component" />
    <input name="project_root" type="path" required="true" description="Path to project root directory" />
    <input name="project_analysis" type="object" default="{}" description="Project analysis data (optional)" />
    <input name="scope" type="string" default="high-level" description="Scope: high-level, detailed, or specific" />
    <input name="focus" type="string" default="" description="Specific component/feature to focus on (optional)" />
  </inputs>

  <outputs>
    <output name="diagram_code" type="string" />
    <output name="diagram_type" type="string" />
    <output name="description" type="string" />
  </outputs>

  <flow>

    <step n="1" goal="Validate inputs">
      <action>Verify {{diagram_type}} is one of supported types:</action>
      <action>  - architecture (C4-style system architecture)</action>
      <action>  - sequence (sequence diagram for interactions)</action>
      <action>  - flowchart (process flow)</action>
      <action>  - er-diagram (entity relationship)</action>
      <action>  - class-diagram (class structure)</action>
      <action>  - component (component relationships)</action>

      <check>If invalid type → HALT with error listing supported types</check>
    </step>

    <step n="2" goal="Generate Architecture Diagram (C4-style)">
      <check>If {{diagram_type}} != "architecture" → Skip to step 3</check>

      <action>Analyze project structure to identify:</action>
      <action>  - System boundaries</action>
      <action>  - Main components/services</action>
      <action>  - External systems (databases, APIs, etc.)</action>
      <action>  - Data flows between components</action>

      <action>Create C4 Context or Container diagram using Mermaid:</action>

      <action>Example structure:</action>
      <action>```mermaid</action>
      <action>graph TB</action>
      <action>    subgraph "System Boundary"</action>
      <action>        API[API Server]</action>
      <action>        APP[Web Application]</action>
      <action>        WORKER[Background Worker]</action>
      <action>    end</action>
      <action>    </action>
      <action>    USER[User] --> APP</action>
      <action>    APP --> API</action>
      <action>    API --> DB[(Database)]</action>
      <action>    API --> CACHE[(Cache)]</action>
      <action>    API --> WORKER</action>
      <action>    WORKER --> QUEUE[(Message Queue)]</action>
      <action>    </action>
      <action>    API --> EXT[External API]</action>
      <action>```</action>

      <action>Customize based on {{project_analysis}}:</action>
      <action>  - Use detected frameworks/libraries</action>
      <action>  - Include actual component names from codebase</action>
      <action>  - Add deployment targets if detected (Docker, K8s)</action>

      <action>Store diagram in {{diagram_code}}</action>
      <action>Set {{description}} = explanation of architecture</action>
      <action>Jump to step 8</action>
    </step>

    <step n="3" goal="Generate Sequence Diagram">
      <check>If {{diagram_type}} != "sequence" → Skip to step 4</check>

      <action>Identify a typical user interaction flow:</action>

      <action>For APIs:</action>
      <action>  - Request → Authentication → Processing → Response</action>

      <action>For web apps:</action>
      <action>  - User Action → Frontend → Backend → Database → Response</action>

      <action>Create Mermaid sequence diagram:</action>
      <action>```mermaid</action>
      <action>sequenceDiagram</action>
      <action>    participant User</action>
      <action>    participant Frontend</action>
      <action>    participant API</action>
      <action>    participant Database</action>
      <action>    </action>
      <action>    User->>Frontend: Click Action</action>
      <action>    Frontend->>API: POST /api/resource</action>
      <action>    API->>API: Validate Request</action>
      <action>    API->>Database: Query Data</action>
      <action>    Database-->>API: Return Results</action>
      <action>    API-->>Frontend: JSON Response</action>
      <action>    Frontend-->>User: Update UI</action>
      <action>```</action>

      <action>If {{focus}} is specified:</action>
      <action>  - Create sequence for that specific feature/endpoint</action>

      <action>Store diagram in {{diagram_code}}</action>
      <action>Set {{description}} = explanation of interaction flow</action>
      <action>Jump to step 8</action>
    </step>

    <step n="4" goal="Generate Flowchart">
      <check>If {{diagram_type}} != "flowchart" → Skip to step 5</check>

      <action>Identify a key process or algorithm:</action>
      <action>  - Authentication flow</action>
      <action>  - Data processing pipeline</action>
      <action>  - Request handling logic</action>
      <action>  - Deployment process</action>

      <action>Create Mermaid flowchart:</action>
      <action>```mermaid</action>
      <action>flowchart TD</action>
      <action>    Start([Start]) --> Input[/Receive Input/]</action>
      <action>    Input --> Validate{Valid?}</action>
      <action>    Validate -->|No| Error[Return Error]</action>
      <action>    Validate -->|Yes| Process[Process Data]</action>
      <action>    Process --> Save[Save to Database]</action>
      <action>    Save --> Success[Return Success]</action>
      <action>    Error --> End([End])</action>
      <action>    Success --> End</action>
      <action>```</action>

      <action>If {{focus}} is specified:</action>
      <action>  - Create flowchart for that specific process</action>

      <action>Store diagram in {{diagram_code}}</action>
      <action>Set {{description}} = explanation of process flow</action>
      <action>Jump to step 8</action>
    </step>

    <step n="5" goal="Generate ER Diagram">
      <check>If {{diagram_type}} != "er-diagram" → Skip to step 6</check>

      <action>Analyze codebase for data models:</action>
      <action>  - Database schema files</action>
      <action>  - ORM model definitions (Sequelize, SQLAlchemy, etc.)</action>
      <action>  - Type definitions (TypeScript interfaces)</action>

      <action>Create Mermaid ER diagram:</action>
      <action>```mermaid</action>
      <action>erDiagram</action>
      <action>    USER ||--o{ POST : creates</action>
      <action>    USER {</action>
      <action>        int id PK</action>
      <action>        string email</action>
      <action>        string name</action>
      <action>        datetime created_at</action>
      <action>    }</action>
      <action>    POST ||--o{ COMMENT : has</action>
      <action>    POST {</action>
      <action>        int id PK</action>
      <action>        int user_id FK</action>
      <action>        string title</action>
      <action>        text content</action>
      <action>        datetime published_at</action>
      <action>    }</action>
      <action>    COMMENT {</action>
      <action>        int id PK</action>
      <action>        int post_id FK</action>
      <action>        int user_id FK</action>
      <action>        text content</action>
      <action>        datetime created_at</action>
      <action>    }</action>
      <action>    USER ||--o{ COMMENT : writes</action>
      <action>```</action>

      <action>Extract actual entity names and relationships from codebase</action>

      <action>Store diagram in {{diagram_code}}</action>
      <action>Set {{description}} = explanation of data model</action>
      <action>Jump to step 8</action>
    </step>

    <step n="6" goal="Generate Class Diagram">
      <check>If {{diagram_type}} != "class-diagram" → Skip to step 7</check>

      <action>Identify main classes/modules:</action>
      <action>  - Look for class definitions</action>
      <action>  - Identify inheritance relationships</action>
      <action>  - Note key methods and properties</action>

      <action>Create Mermaid class diagram:</action>
      <action>```mermaid</action>
      <action>classDiagram</action>
      <action>    class BaseService {</action>
      <action>        +initialize()</action>
      <action>        +shutdown()</action>
      <action>        #logger</action>
      <action>    }</action>
      <action>    </action>
      <action>    class UserService {</action>
      <action>        +createUser(data)</action>
      <action>        +getUser(id)</action>
      <action>        +updateUser(id, data)</action>
      <action>        +deleteUser(id)</action>
      <action>    }</action>
      <action>    </action>
      <action>    class AuthService {</action>
      <action>        +login(credentials)</action>
      <action>        +logout(token)</action>
      <action>        +validateToken(token)</action>
      <action>    }</action>
      <action>    </action>
      <action>    BaseService <|-- UserService</action>
      <action>    BaseService <|-- AuthService</action>
      <action>    UserService --> AuthService : uses</action>
      <action>```</action>

      <action>If {{scope}} == "detailed":</action>
      <action>  - Include more methods and properties</action>
      <action>  - Show parameter types</action>

      <action>Store diagram in {{diagram_code}}</action>
      <action>Set {{description}} = explanation of class structure</action>
      <action>Jump to step 8</action>
    </step>

    <step n="7" goal="Generate Component Diagram">
      <action>Identify major components/modules:</action>
      <action>  - Frontend components</action>
      <action>  - Backend services</action>
      <action>  - Shared libraries</action>
      <action>  - External integrations</action>

      <action>Create Mermaid component diagram:</action>
      <action>```mermaid</action>
      <action>graph LR</action>
      <action>    subgraph Frontend</action>
      <action>        UI[UI Components]</action>
      <action>        STATE[State Management]</action>
      <action>        API_CLIENT[API Client]</action>
      <action>    end</action>
      <action>    </action>
      <action>    subgraph Backend</action>
      <action>        ROUTER[Router]</action>
      <action>        CONTROLLER[Controllers]</action>
      <action>        SERVICE[Business Logic]</action>
      <action>        REPO[Data Repository]</action>
      <action>    end</action>
      <action>    </action>
      <action>    UI --> STATE</action>
      <action>    STATE --> API_CLIENT</action>
      <action>    API_CLIENT --> ROUTER</action>
      <action>    ROUTER --> CONTROLLER</action>
      <action>    CONTROLLER --> SERVICE</action>
      <action>    SERVICE --> REPO</action>
      <action>```</action>

      <action>Customize based on actual project structure</action>

      <action>Store diagram in {{diagram_code}}</action>
      <action>Set {{description}} = explanation of component architecture</action>
    </step>

    <step n="8" goal="Add metadata and formatting">
      <action>Wrap diagram code in proper markdown code block:</action>
      <action>```markdown</action>
      <action>### {{diagram_title}}</action>
      <action></action>
      <action>{{description}}</action>
      <action></action>
      <action>```mermaid</action>
      <action>{{diagram_code}}</action>
      <action>```</action>
      <action></action>
      <action>```</action>

      <action>Add explanatory notes if needed</action>
    </step>

    <step n="9" goal="Return diagram">
      <output>
Generated {{diagram_type}} diagram

Scope: {{scope}}
{{#if focus}}Focus: {{focus}}{{/if}}

Description: {{description}}

Diagram ready for inclusion in documentation.
Use the diagram_code output in markdown documentation.
</output>
    </step>

  </flow>

  <error-handling>
    <on-error step="1">HALT with error - invalid diagram type</on-error>
    <on-error step="2-7">Generate simplified/generic diagram with placeholder content</on-error>
  </error-handling>

  <examples>
    <example name="Architecture diagram for API">
      <input>
        diagram_type: "architecture"
        project_root: /projects/my-api
        scope: "high-level"
      </input>
      <output>
        diagram_code: "graph TB\n  subgraph 'API System'..."
        diagram_type: "architecture"
        description: "High-level architecture showing API server, database, and cache"
      </output>
    </example>

    <example name="Sequence diagram for authentication">
      <input>
        diagram_type: "sequence"
        focus: "authentication"
      </input>
      <output>
        diagram_code: "sequenceDiagram\n  participant User..."
        diagram_type: "sequence"
        description: "User authentication flow from login to token generation"
      </output>
    </example>
  </examples>

</task>
```
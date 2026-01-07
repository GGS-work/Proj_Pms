# Database Schema Documentation

**Project:** GGS Management System (EMS)  
**Database:** PostgreSQL (Neon)  
**ORM:** Drizzle ORM  
**Total Tables:** 31

---

## Core Tables (6)

### 1. `users`
**Purpose:** User accounts and profile information

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | User ID |
| name | text | NOT NULL, unique | Full name |
| email | text | NOT NULL, unique | Email address |
| emailVerified | timestamp | nullable | Email verification timestamp |
| image | text | nullable | Profile image URL |
| password | text | nullable | Hashed password |
| dateOfBirth | timestamp | nullable | Date of birth |
| native | text | nullable | Hometown/native place |
| mobileNo | text | unique | Mobile number |
| designation | text | nullable | Job designation |
| department | text | nullable | Department |
| experience | integer | nullable | Years of experience |
| dateOfJoining | timestamp | nullable | Joining date |
| skills | jsonb | default [] | Array of skills |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** email_idx, name_idx, mobile_idx

---

### 2. `accounts`
**Purpose:** OAuth provider accounts (Google, GitHub, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| userId | uuid | NOT NULL, FK → users.id | User reference |
| type | text | NOT NULL | Account type |
| provider | text | NOT NULL | OAuth provider |
| providerAccountId | text | NOT NULL | Provider account ID |
| refreshToken | text | nullable | OAuth refresh token |
| accessToken | text | nullable | OAuth access token |
| expiresAt | integer | nullable | Token expiry |
| tokenType | text | nullable | Token type |
| scope | text | nullable | OAuth scope |
| idToken | text | nullable | ID token |
| sessionState | text | nullable | Session state |

**Indexes:** accounts_user_idx

---

### 3. `user_sessions`
**Purpose:** User authentication sessions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| sessionToken | text | PK | Session token |
| userId | uuid | NOT NULL, FK → users.id | User reference |
| expires | timestamp | NOT NULL | Session expiry |

**Indexes:** sessions_user_idx

**Note:** Renamed from `sessions` to avoid conflict with Supabase auth.sessions

---

### 4. `verification_tokens`
**Purpose:** Email verification and password reset tokens

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| identifier | text | NOT NULL | Email/identifier |
| token | text | NOT NULL | Verification token |
| expires | timestamp | NOT NULL | Token expiry |

---

### 5. `workspaces`
**Purpose:** Organization workspaces for team collaboration

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Workspace ID |
| name | text | NOT NULL | Workspace name |
| imageUrl | text | nullable | Workspace logo |
| inviteCode | text | NOT NULL, unique | Invite code |
| userId | uuid | NOT NULL, FK → users.id | Owner user ID |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspaces_user_idx, workspaces_invite_code_idx

---

### 6. `members`
**Purpose:** Workspace membership and roles

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Member ID |
| userId | uuid | NOT NULL, FK → users.id | User reference |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| projectId | uuid | nullable, FK → projects.id | Project reference (for CLIENT role) |
| role | text | NOT NULL, default 'MEMBER' | Role (ADMIN, MEMBER, CLIENT) |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** members_user_idx, members_workspace_idx, members_project_idx, members_user_workspace_idx

---

## Project Management Tables (8)

### 7. `projects`
**Purpose:** Projects within workspaces

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Project ID |
| name | text | NOT NULL | Project name |
| imageUrl | text | nullable | Project image |
| workspaceId | uuid | nullable, FK → workspaces.id | Workspace reference |
| postDate | timestamp | nullable | Project post date |
| tentativeEndDate | timestamp | nullable | Expected completion date |
| assignees | jsonb | default [] | Array of user IDs |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** projects_workspace_idx

---

### 8. `tasks`
**Purpose:** Main task/issue tracking (Jira-like)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Task ID |
| summary | text | NOT NULL | Task title |
| issueId | text | NOT NULL, unique | Issue ID (e.g., VECV-601) |
| issueType | text | NOT NULL, default 'Task' | Task, Bug, Epic, Story |
| status | text | NOT NULL, default 'To Do' | Task status |
| projectName | text | nullable | Project name |
| priority | text | default 'Medium' | Priority level |
| resolution | text | nullable | Resolution status |
| assigneeId | uuid | nullable, FK → users.id | Assigned user |
| reporterId | uuid | nullable, FK → users.id | Reporter user |
| creatorId | uuid | nullable, FK → users.id | Creator user |
| parentTaskId | uuid | nullable, FK → tasks.id | Parent task (for subtasks) |
| created | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updated | timestamp | NOT NULL, default NOW() | Update timestamp |
| resolved | timestamp | nullable | Resolution timestamp |
| dueDate | timestamp | nullable | Due date |
| labels | jsonb | nullable | Array of labels |
| description | text | nullable | Task description |
| customFields | jsonb | nullable | Dynamic custom fields |
| projectId | uuid | nullable, FK → projects.id | Project reference |
| workspaceId | uuid | nullable, FK → workspaces.id | Workspace reference |
| uploadBatchId | text | nullable | CSV upload batch ID |
| uploadedAt | timestamp | nullable | Upload timestamp |
| uploadedBy | uuid | nullable, FK → users.id | Uploader user |
| estimatedHours | integer | nullable | Estimated hours |
| actualHours | integer | default 0 | Actual hours spent |
| position | integer | NOT NULL, default 1000 | Display position |

**Indexes:** 16 indexes including issue_id, assignee, reporter, status, priority, project_name, issue_type, due_date, workspace_created, workspace_status_created, etc.

---

### 9. `task_overviews`
**Purpose:** Task completion validation and proof of work

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Overview ID |
| taskId | uuid | NOT NULL, FK → tasks.id, unique | Task reference |
| employeeId | uuid | NOT NULL, FK → users.id | Employee reference |
| completedWorkDescription | text | NOT NULL | Work description |
| completionMethod | text | NOT NULL | Completion method |
| stepsFollowed | text | NOT NULL | Steps followed |
| proofOfWork | jsonb | NOT NULL | Screenshots, files, links, commits |
| challenges | text | nullable | Challenges faced |
| additionalRemarks | text | nullable | Extra notes |
| timeSpent | integer | nullable | Time in minutes |
| taskTitle | text | NOT NULL | Auto-filled task title |
| employeeName | text | NOT NULL | Auto-filled employee name |
| resolvedDate | timestamp | nullable | Resolution date |
| resolvedTime | text | nullable | Resolution time |
| status | text | NOT NULL, default 'PENDING' | PENDING, APPROVED, REWORK |
| adminRemarks | text | nullable | Admin feedback |
| reviewedBy | uuid | nullable, FK → users.id | Reviewer user |
| reviewedAt | timestamp | nullable | Review timestamp |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** task_idx, employee_idx, status_idx, reviewer_idx, unique_task_overview

---

### 10. `activity_logs`
**Purpose:** Jira-style comprehensive activity tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Log ID |
| actionType | text | NOT NULL | TASK_CREATED, TASK_UPDATED, etc. |
| entityType | text | NOT NULL | TASK, PROJECT, USER, WORKSPACE |
| entityId | uuid | NOT NULL | Entity ID |
| userId | uuid | NOT NULL, FK → users.id | Actor user |
| userName | text | NOT NULL | Actor name (denormalized) |
| workspaceId | uuid | nullable, FK → workspaces.id | Workspace context |
| projectId | uuid | nullable, FK → projects.id | Project context |
| taskId | uuid | nullable, FK → tasks.id | Task context |
| changes | jsonb | nullable | Change details |
| summary | text | NOT NULL | Human-readable summary |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |

**Indexes:** entity_idx, user_idx, workspace_idx, task_idx, project_idx, created_at_idx, action_type_idx, workspace_created_idx

---

### 11. `notifications`
**Purpose:** User notifications for task updates

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Notification ID |
| userId | uuid | NOT NULL, FK → users.id | Recipient user |
| taskId | uuid | nullable, FK → tasks.id | Related task |
| type | text | NOT NULL | Notification type |
| title | text | NOT NULL | Notification title |
| message | text | NOT NULL | Notification message |
| actionBy | uuid | nullable, FK → users.id | Triggering user |
| actionByName | text | nullable | Triggering user name |
| isRead | text | NOT NULL, default 'false' | Read status |
| readAt | timestamp | nullable | Read timestamp |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |

**Indexes:** user_idx, task_idx, type_idx, is_read_idx, user_unread_idx

---

### 12. `project_requirements`
**Purpose:** Project requirements and specifications

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Requirement ID |
| tentativeTitle | text | NOT NULL | Project title |
| customer | text | NOT NULL | Customer name |
| projectManagerId | uuid | nullable, FK → users.id | PM reference |
| projectDescription | text | nullable | Description |
| dueDate | timestamp | nullable | Due date |
| sampleInputFiles | jsonb | default [] | Array of file URLs |
| expectedOutputFiles | jsonb | default [] | Array of file URLs |
| status | text | NOT NULL, default 'PENDING' | PENDING, APPROVED, REJECTED |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** project_manager_idx, status_idx, due_date_idx

---

### 13. `invitations`
**Purpose:** Workspace member invitations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Invitation ID |
| email | text | NOT NULL | Invitee email |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| invitedBy | uuid | NOT NULL, FK → users.id | Inviter user |
| status | text | NOT NULL, default 'PENDING' | Invitation status |
| expiresAt | timestamp | NOT NULL | Expiry timestamp |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** email_idx, workspace_idx, status_idx

---

### 14. `client_invitations`
**Purpose:** External client invitations for project viewing

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Invitation ID |
| email | text | NOT NULL | Client email |
| projectId | uuid | NOT NULL, FK → projects.id | Project reference |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| invitedBy | uuid | NOT NULL, FK → users.id | Inviter user |
| token | text | NOT NULL, unique | Unique token |
| status | text | NOT NULL, default 'pending' | pending, accepted, expired, revoked |
| expiresAt | timestamp | NOT NULL | Expiry timestamp |
| acceptedAt | timestamp | nullable | Acceptance timestamp |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** email_idx, project_idx, token_idx, status_idx

---

## Attendance & Reports Tables (2)

### 15. `attendance`
**Purpose:** Employee attendance and shift tracking

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Attendance ID |
| userId | uuid | NOT NULL, FK → users.id | Employee reference |
| workspaceId | uuid | nullable, FK → workspaces.id | Workspace reference |
| projectId | uuid | nullable, FK → projects.id | Project reference |
| shiftStartTime | timestamp | NOT NULL | Shift start |
| shiftEndTime | timestamp | nullable | Shift end |
| totalDuration | integer | nullable | Duration in minutes |
| endActivity | text | nullable | End activity description |
| dailyTasks | jsonb | nullable | Array of task strings |
| status | text | NOT NULL, default 'IN_PROGRESS' | IN_PROGRESS, COMPLETED, AUTO_COMPLETED |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** user_idx, workspace_idx, project_idx, date_idx, status_idx, user_date_idx

---

### 16. `weekly_reports`
**Purpose:** Employee weekly report submissions

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Report ID |
| userId | uuid | NOT NULL, FK → users.id | Employee reference |
| fromDate | timestamp | NOT NULL | Start date |
| toDate | timestamp | NOT NULL | End date |
| department | text | NOT NULL | Department |
| dailyDescriptions | jsonb | NOT NULL, default {} | Daily work descriptions |
| uploadedFiles | jsonb | NOT NULL, default [] | Array of uploaded files |
| status | text | NOT NULL, default 'submitted' | submitted, reviewed, archived |
| isDraft | text | NOT NULL, default 'false' | Draft status |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** user_idx, department_idx, from_date_idx, to_date_idx, created_at_idx, is_draft_idx

---

## Bug Tracking Tables (3)

### 17. `bugs`
**Purpose:** Bug tracking system

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Bug ID |
| bugId | text | NOT NULL, unique | Bug ID (BUG-001) |
| assignedTo | uuid | nullable, FK → users.id | Assigned developer |
| bugType | text | NOT NULL, default 'Development' | Bug category |
| bugDescription | text | NOT NULL | Bug description |
| fileUrl | text | nullable | Attachment URL |
| outputFileUrl | text | nullable | Resolution file URL |
| status | text | NOT NULL, default 'Open' | Open, In Progress, Resolved, Closed |
| priority | text | default 'Medium' | Low, Medium, High, Critical |
| reportedBy | uuid | NOT NULL, FK → users.id | Reporter user |
| reportedByName | text | NOT NULL | Reporter name |
| workspaceId | uuid | nullable, FK → workspaces.id | Workspace reference |
| resolvedAt | timestamp | nullable | Resolution timestamp |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** bug_id_idx, assigned_to_idx, bug_type_idx, status_idx, reported_by_idx, workspace_idx, created_at_idx

---

### 18. `bug_comments`
**Purpose:** Bug conversation history

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Comment ID |
| bugId | uuid | NOT NULL, FK → bugs.id | Bug reference |
| userId | uuid | NOT NULL, FK → users.id | Commenter user |
| userName | text | NOT NULL | Commenter name |
| comment | text | NOT NULL | Comment text |
| fileUrl | text | nullable | Attachment URL |
| isSystemComment | boolean | NOT NULL, default false | System-generated comment |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |

**Indexes:** bug_id_idx, user_id_idx, created_at_idx

---

### 19. `custom_bug_types`
**Purpose:** User-defined bug types

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Type ID |
| name | text | NOT NULL, unique | Bug type name |
| createdAt | timestamp | default NOW() | Creation timestamp |

**Indexes:** name_idx

---

## Custom Configuration Tables (4)

### 20. `custom_designations`
**Purpose:** User-defined job designations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Designation ID |
| name | text | NOT NULL, unique | Designation name |
| createdAt | timestamp | default NOW() | Creation timestamp |

**Indexes:** name_idx

---

### 21. `custom_departments`
**Purpose:** User-defined departments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Department ID |
| name | text | NOT NULL, unique | Department name |
| createdAt | timestamp | default NOW() | Creation timestamp |

**Indexes:** name_idx

---

### 22. `board_columns`
**Purpose:** Dynamic Jira-style board columns

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Column ID |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| name | text | NOT NULL | Column name |
| position | integer | NOT NULL, default 0 | Display order |
| color | text | default '#808080' | Hex color |
| category | text | NOT NULL, default 'TODO' | TODO, IN_PROGRESS, DONE |
| isDefault | boolean | NOT NULL, default false | System default |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspace_idx, position_idx

---

### 23. `list_view_columns`
**Purpose:** Dynamic column configuration for list view

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Column ID |
| workspaceId | uuid | nullable, FK → workspaces.id | Workspace reference |
| projectId | uuid | nullable, FK → projects.id | Project reference |
| fieldName | text | NOT NULL | Field name |
| displayName | text | NOT NULL | Display name |
| columnType | text | NOT NULL, default 'text' | Column type |
| width | integer | default 150 | Width in pixels |
| position | integer | NOT NULL, default 0 | Display order |
| isVisible | boolean | NOT NULL, default true | Visibility |
| isSortable | boolean | NOT NULL, default true | Sortable |
| isFilterable | boolean | NOT NULL, default true | Filterable |
| isSystem | boolean | NOT NULL, default false | System column |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspace_idx, project_idx, project_position_idx

---

## Jira-Like Dynamic Field System (7)

### 24. `custom_field_definitions`
**Purpose:** Define custom fields for tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Field ID |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| fieldName | text | NOT NULL | Field name |
| fieldKey | text | NOT NULL | Field key |
| fieldType | text | NOT NULL | TEXT, NUMBER, DATE, SELECT, etc. |
| fieldDescription | text | nullable | Description |
| isRequired | boolean | default false | Required field |
| defaultValue | text | nullable | Default value |
| fieldOptions | jsonb | nullable | Options for SELECT |
| validationRules | jsonb | nullable | Validation rules |
| appliesToIssueTypes | jsonb | nullable | Issue types |
| appliesToProjects | jsonb | nullable | Project IDs |
| displayOrder | integer | default 1000 | Display order |
| isVisibleInList | boolean | default false | List visibility |
| isVisibleInDetail | boolean | default true | Detail visibility |
| isSearchable | boolean | default true | Searchable |
| isFilterable | boolean | default true | Filterable |
| isSystemField | boolean | default false | System field |
| createdBy | uuid | nullable, FK → users.id | Creator user |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspace_idx, field_key_idx, unique_key_per_workspace

---

### 25. `custom_field_values`
**Purpose:** Store custom field values for tasks

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Value ID |
| taskId | uuid | NOT NULL, FK → tasks.id | Task reference |
| fieldDefinitionId | uuid | NOT NULL, FK → custom_field_definitions.id | Field reference |
| value | text | nullable | String value |
| valueNumber | integer | nullable | Numeric value |
| valueDate | timestamp | nullable | Date value |
| valueUserId | uuid | nullable, FK → users.id | User reference value |
| valueJson | jsonb | nullable | Complex values |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** task_idx, field_definition_idx, unique_value_per_task

---

### 26. `issue_type_configs`
**Purpose:** Define issue types (Task, Bug, Epic, etc.)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Config ID |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| issueTypeName | text | NOT NULL | Issue type name |
| issueTypeKey | text | NOT NULL | Issue type key |
| description | text | nullable | Description |
| icon | text | nullable | Icon identifier |
| color | text | nullable | Color |
| isSubtaskType | boolean | default false | Subtask type |
| workflowId | uuid | nullable | Workflow reference |
| displayOrder | integer | default 1000 | Display order |
| isActive | boolean | default true | Active status |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspace_idx, unique_key_per_workspace

---

### 27. `workflows`
**Purpose:** Define workflow configurations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Workflow ID |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| name | text | NOT NULL | Workflow name |
| description | text | nullable | Description |
| statuses | jsonb | NOT NULL | Array of status objects |
| transitions | jsonb | NOT NULL | Workflow transitions |
| isDefault | boolean | default false | Default workflow |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspace_idx

---

### 28. `board_configs`
**Purpose:** Board (Kanban/Scrum) configurations

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Board ID |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| projectId | uuid | nullable, FK → projects.id | Project reference |
| name | text | NOT NULL | Board name |
| boardType | text | NOT NULL, default 'KANBAN' | KANBAN, SCRUM |
| description | text | nullable | Description |
| columns | jsonb | NOT NULL | Column configurations |
| filterConfig | jsonb | nullable | Filter configuration |
| cardColorBy | text | default 'PRIORITY' | Card color scheme |
| swimlanesBy | text | nullable | Swimlane grouping |
| sprintDurationWeeks | integer | nullable | Sprint duration (Scrum) |
| isFavorite | boolean | default false | Favorite status |
| createdBy | uuid | nullable, FK → users.id | Creator user |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspace_idx, project_idx

---

### 29. `sprints`
**Purpose:** Sprint management (Scrum)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Sprint ID |
| workspaceId | uuid | NOT NULL, FK → workspaces.id | Workspace reference |
| boardId | uuid | NOT NULL, FK → board_configs.id | Board reference |
| name | text | NOT NULL | Sprint name |
| goal | text | nullable | Sprint goal |
| startDate | timestamp | nullable | Start date |
| endDate | timestamp | nullable | End date |
| state | text | NOT NULL, default 'FUTURE' | FUTURE, ACTIVE, CLOSED |
| completedAt | timestamp | nullable | Completion timestamp |
| createdAt | timestamp | NOT NULL, default NOW() | Creation timestamp |
| updatedAt | timestamp | NOT NULL, default NOW() | Update timestamp |

**Indexes:** workspace_idx, board_idx, state_idx

---

### 30. `sprint_tasks`
**Purpose:** Sprint-task assignments

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default random | Assignment ID |
| sprintId | uuid | NOT NULL, FK → sprints.id | Sprint reference |
| taskId | uuid | NOT NULL, FK → tasks.id | Task reference |
| addedAt | timestamp | NOT NULL, default NOW() | Addition timestamp |
| removedAt | timestamp | nullable | Removal timestamp |

**Indexes:** sprint_idx, task_idx, unique_sprint_task

---

## Summary Statistics

- **Total Tables:** 31
- **Core Authentication:** 4 tables (users, accounts, user_sessions, verification_tokens)
- **Organization:** 2 tables (workspaces, members)
- **Project Management:** 8 tables (projects, tasks, task_overviews, activity_logs, notifications, requirements, invitations, client_invitations)
- **Attendance & Reports:** 2 tables (attendance, weekly_reports)
- **Bug Tracking:** 3 tables (bugs, bug_comments, custom_bug_types)
- **Configuration:** 4 tables (custom_designations, custom_departments, board_columns, list_view_columns)
- **Jira-Like System:** 7 tables (custom_field_definitions, custom_field_values, issue_type_configs, workflows, board_configs, sprints, sprint_tasks)
- **Custom Types:** 1 table (custom_bug_types)

## Key Features

### 1. **Jira-Like Task Management**
- Hierarchical tasks with parent-child relationships
- Custom fields system (like Jira custom fields)
- Dynamic issue types and workflows
- Sprint management (Scrum/Agile)
- Kanban/Scrum boards with configurable columns

### 2. **Comprehensive Tracking**
- Activity logs for all changes (audit trail)
- Task overviews with proof of work
- Time tracking (estimated vs actual hours)
- Weekly reports with file uploads

### 3. **Role-Based Access Control**
- Workspace owners (ADMIN)
- Regular members (MEMBER)
- External clients (CLIENT) - project-scoped
- Granular permissions

### 4. **Extensibility**
- Custom field definitions
- Custom bug types
- Custom designations and departments
- Configurable board columns
- Dynamic list view columns

### 5. **Collaboration**
- Member invitations
- Client invitations (project-specific)
- Notifications system
- Bug tracking with comments
- Activity feeds

### 6. **Data Integrity**
- Foreign key relationships with CASCADE/SET NULL
- Unique constraints
- Comprehensive indexing for performance
- Timestamps for all entities

---

**Generated:** 2026-01-07  
**Schema File:** `src/db/schema.ts`  
**Migration System:** Drizzle Kit

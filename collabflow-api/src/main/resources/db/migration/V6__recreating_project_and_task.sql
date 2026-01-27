-- ===========================================
-- V6__drop_projects_tasklists_tasks.sql
-- Drops Projects, Task Lists, Tasks and related tables
-- ===========================================

-- Drop triggers first
DROP TRIGGER IF EXISTS trg_update_tasks_updated_at ON tasks;
DROP TRIGGER IF EXISTS trg_update_task_lists_updated_at ON task_lists;
DROP TRIGGER IF EXISTS trg_update_projects_updated_at ON projects;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop junction/association tables first (they have FKs to main tables)
DROP TABLE IF EXISTS task_labels CASCADE;
DROP TABLE IF EXISTS task_assignments CASCADE;

-- Drop labels table
DROP TABLE IF EXISTS labels CASCADE;

-- Drop tasks table (has FKs to task_lists and projects)
DROP TABLE IF EXISTS tasks CASCADE;

-- Drop task_lists table (has FK to projects)
DROP TABLE IF EXISTS task_lists CASCADE;

-- Drop projects table
DROP TABLE IF EXISTS projects CASCADE;


-- ===========================================
-- CLEAN PROJECT MANAGEMENT SCHEMA
-- ===========================================

-- ===========================================
-- PROJECTS
-- ===========================================
CREATE TABLE projects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          team_id UUID NOT NULL,
                          name TEXT NOT NULL,
                          description TEXT,
                          is_deleted BOOLEAN DEFAULT FALSE,
                          created_at TIMESTAMPTZ DEFAULT NOW(),
                          updated_at TIMESTAMPTZ DEFAULT NOW(),

                          CONSTRAINT fk_project_team
                              FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX idx_project_team ON projects(team_id);
CREATE INDEX idx_project_active ON projects(id) WHERE is_deleted = FALSE;


-- ===========================================
-- TASK LISTS (KANBAN COLUMNS)
-- ===========================================
CREATE TABLE task_lists (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            project_id UUID NOT NULL,
                            name TEXT NOT NULL,
                            position NUMERIC DEFAULT 0,
                            is_deleted BOOLEAN DEFAULT FALSE,
                            created_at TIMESTAMPTZ DEFAULT NOW(),
                            updated_at TIMESTAMPTZ DEFAULT NOW(),

                            CONSTRAINT fk_tasklist_project
                                FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasklist_project ON task_lists(project_id);
CREATE INDEX idx_tasklist_active ON task_lists(project_id) WHERE is_deleted = FALSE;


-- ===========================================
-- TASKS
-- ===========================================
CREATE TABLE tasks (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       project_id UUID NOT NULL,
                       task_list_id UUID NOT NULL,
                       title TEXT NOT NULL,
                       description TEXT,
                       position NUMERIC DEFAULT 0,
                       priority SMALLINT DEFAULT 0 CHECK(priority >= 0 AND priority <= 5),
                       due_date TIMESTAMPTZ,
                       is_completed BOOLEAN DEFAULT FALSE,
                       is_deleted BOOLEAN DEFAULT FALSE,
                       version BIGINT DEFAULT 0,
                       created_by UUID,
                       created_at TIMESTAMPTZ DEFAULT NOW(),
                       updated_at TIMESTAMPTZ DEFAULT NOW(),

                       CONSTRAINT fk_task_project
                           FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
                       CONSTRAINT fk_task_list
                           FOREIGN KEY (task_list_id) REFERENCES task_lists(id) ON DELETE CASCADE,
                       CONSTRAINT fk_task_user
                           FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_task_list_position ON tasks(task_list_id, position);
CREATE INDEX idx_task_project ON tasks(project_id);


-- ===========================================
-- TASK ASSIGNMENTS (MANY TO MANY)
-- ===========================================
CREATE TABLE task_assignments (
                                  task_id UUID NOT NULL,
                                  user_id UUID NOT NULL,
                                  assigned_at TIMESTAMPTZ DEFAULT NOW(),
                                  PRIMARY KEY(task_id, user_id),

                                  CONSTRAINT fk_taskassign_task
                                      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_taskassign_user
                                      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

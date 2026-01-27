-- ===========================================
-- V5__projects_tasklists_tasks_enhanced.sql
-- Enhanced Projects, Task Lists, Tasks with Kanban-ready fields
-- ===========================================

-- ===========================================
-- PROJECTS TABLE
-- ===========================================
CREATE TABLE projects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          team_id UUID NOT NULL,
                          name TEXT NOT NULL,
                          description TEXT,
                          is_deleted BOOLEAN DEFAULT FALSE,
                          created_at TIMESTAMPTZ DEFAULT NOW(),
                          updated_at TIMESTAMPTZ DEFAULT NOW(),

                          CONSTRAINT fk_projects_team FOREIGN KEY (team_id)
                              REFERENCES teams(id) ON DELETE CASCADE
);

CREATE INDEX idx_projects_team_id ON projects(team_id);
CREATE INDEX idx_projects_not_deleted ON projects(id) WHERE is_deleted = FALSE;


-- ===========================================
-- TASK LISTS TABLE (Kanban columns)
-- ===========================================
CREATE TABLE task_lists (
                            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                            project_id UUID NOT NULL,
                            name TEXT NOT NULL,
                            position NUMERIC NOT NULL DEFAULT 0,
                            is_deleted BOOLEAN DEFAULT FALSE,
                            created_at TIMESTAMPTZ DEFAULT NOW(),
                            updated_at TIMESTAMPTZ DEFAULT NOW(),

                            CONSTRAINT fk_task_lists_project FOREIGN KEY (project_id)
                                REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_task_lists_project ON task_lists(project_id);
CREATE INDEX idx_task_lists_position ON task_lists(project_id, position);
CREATE INDEX idx_task_lists_not_deleted ON task_lists(project_id) WHERE is_deleted = FALSE;


-- ===========================================
-- TASKS TABLE
-- ===========================================
CREATE TABLE tasks (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       project_id UUID NOT NULL,
                       task_list_id UUID NOT NULL,
                       title TEXT NOT NULL,
                       description TEXT,
                       position NUMERIC NOT NULL DEFAULT 0,
                       priority SMALLINT DEFAULT 0 CHECK(priority >= 0 AND priority <= 5),
                       due_date TIMESTAMPTZ,
                       is_completed BOOLEAN DEFAULT FALSE,
                       is_deleted BOOLEAN DEFAULT FALSE,
                       version BIGINT DEFAULT 0,
                       created_by UUID,
                       created_at TIMESTAMPTZ DEFAULT NOW(),
                       updated_at TIMESTAMPTZ DEFAULT NOW(),

                       CONSTRAINT fk_tasks_project FOREIGN KEY (project_id)
                           REFERENCES projects(id) ON DELETE CASCADE,
                       CONSTRAINT fk_tasks_list FOREIGN KEY (task_list_id)
                           REFERENCES task_lists(id) ON DELETE CASCADE,
                       CONSTRAINT fk_tasks_created_by FOREIGN KEY (created_by)
                           REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX idx_tasks_by_list_pos ON tasks(task_list_id, position);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_active ON tasks(is_completed, is_deleted);


-- ===========================================
-- TASK ASSIGNMENTS (many-to-many)
-- ===========================================
CREATE TABLE task_assignments (
                                  task_id UUID NOT NULL,
                                  user_id UUID NOT NULL,
                                  assigned_at TIMESTAMPTZ DEFAULT NOW(),
                                  PRIMARY KEY(task_id, user_id),

                                  CONSTRAINT fk_task_assignments_task FOREIGN KEY (task_id)
                                      REFERENCES tasks(id) ON DELETE CASCADE,
                                  CONSTRAINT fk_task_assignments_user FOREIGN KEY (user_id)
                                      REFERENCES users(id) ON DELETE CASCADE
);

-- ===========================================
-- TASK LABELS / TAGS
-- ===========================================
CREATE TABLE labels (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        name TEXT NOT NULL,
                        color TEXT DEFAULT '#cccccc'
);

CREATE TABLE task_labels (
                             task_id UUID NOT NULL,
                             label_id UUID NOT NULL,
                             PRIMARY KEY(task_id, label_id),

                             CONSTRAINT fk_task_labels_task FOREIGN KEY (task_id)
                                 REFERENCES tasks(id) ON DELETE CASCADE,
                             CONSTRAINT fk_task_labels_label FOREIGN KEY (label_id)
                                 REFERENCES labels(id) ON DELETE CASCADE
);

-- ===========================================
-- UPDATED_AT TRIGGER FUNCTION
-- ===========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_task_lists_updated_at
    BEFORE UPDATE ON task_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

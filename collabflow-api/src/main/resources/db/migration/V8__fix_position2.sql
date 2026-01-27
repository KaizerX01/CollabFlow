-- V3__fix_position_columns.sql
ALTER TABLE task_lists
ALTER COLUMN position TYPE DOUBLE PRECISION;

ALTER TABLE tasks
ALTER COLUMN position TYPE DOUBLE PRECISION;

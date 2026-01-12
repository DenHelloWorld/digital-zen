-- Migration script for focused_times table
-- This script updates the focused_times table to use DATETIME instead of TIME
-- Run this on existing databases to fix the schema mismatch

-- Step 1: Modify start_from column from TIME to DATETIME
ALTER TABLE focused_times 
MODIFY COLUMN start_from DATETIME;

-- Step 2: Modify end_to column from TIME to DATETIME
ALTER TABLE focused_times 
MODIFY COLUMN end_to DATETIME;

-- Verification query (optional - run after migration)
-- SHOW COLUMNS FROM focused_times WHERE Field IN ('start_from', 'end_to');

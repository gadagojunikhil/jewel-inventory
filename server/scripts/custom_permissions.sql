-- Custom Permissions Table
CREATE TABLE IF NOT EXISTS custom_permissions (
    id SERIAL PRIMARY KEY,
    page_id VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    has_access BOOLEAN NOT NULL DEFAULT false,
    access_level VARCHAR(20) NOT NULL DEFAULT 'none',
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(page_id, role)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_custom_permissions_page_role ON custom_permissions(page_id, role);
CREATE INDEX IF NOT EXISTS idx_custom_permissions_role ON custom_permissions(role);

-- Add some sample data (optional)
-- INSERT INTO custom_permissions (page_id, role, has_access, access_level) VALUES
-- ('dashboard', 'user', true, 'view'),
-- ('user-management', 'user', false, 'none');

COMMENT ON TABLE custom_permissions IS 'Stores custom permission overrides for system pages and user roles';
COMMENT ON COLUMN custom_permissions.page_id IS 'Identifier for the system page/feature';
COMMENT ON COLUMN custom_permissions.role IS 'User role (super_admin, admin, manager, user)';
COMMENT ON COLUMN custom_permissions.has_access IS 'Whether the role has access to this page';
COMMENT ON COLUMN custom_permissions.access_level IS 'Level of access (none, view, edit, full)';

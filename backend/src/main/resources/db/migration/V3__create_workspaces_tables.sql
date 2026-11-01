
CREATE TABLE workspaces (
                            id BIGSERIAL PRIMARY KEY,
                            name VARCHAR(150) NOT NULL,
                            description VARCHAR(1000),
                            created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            CONSTRAINT ck_workspaces_name_not_blank
                                CHECK (LENGTH(BTRIM(name)) > 0)
);

CREATE TABLE workspace_members (
                                   workspace_id BIGINT NOT NULL,
                                   user_id BIGINT NOT NULL,
                                   role VARCHAR(20) NOT NULL,
                                   joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

                                   CONSTRAINT pk_workspace_members
                                       PRIMARY KEY (workspace_id, user_id),

                                   CONSTRAINT fk_workspace_members_workspace
                                       FOREIGN KEY (workspace_id)
                                           REFERENCES workspaces(id)
                                           ON DELETE CASCADE,

    -- User deletion must first transfer ownership or delete
    -- workspaces solely owned by that user in the service layer.
                                   CONSTRAINT fk_workspace_members_user
                                       FOREIGN KEY (user_id)
                                           REFERENCES users(id)
                                           ON DELETE CASCADE,

                                   CONSTRAINT ck_workspace_members_role
                                       CHECK (role IN ('OWNER', 'EDITOR', 'VIEWER'))
);

CREATE INDEX idx_workspace_members_user_id
    ON workspace_members(user_id);

CREATE UNIQUE INDEX uq_workspace_members_single_owner
    ON workspace_members(workspace_id)
    WHERE role = 'OWNER';

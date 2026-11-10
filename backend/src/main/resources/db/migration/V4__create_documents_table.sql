CREATE TABLE documents (
                           id BIGSERIAL PRIMARY KEY,

                           workspace_id BIGINT NOT NULL,
                           created_by BIGINT NOT NULL,

                           title VARCHAR(150) NOT NULL,
                           description VARCHAR(500),

                           created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                           updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                           CONSTRAINT fk_document_workspace
                               FOREIGN KEY (workspace_id)
                                   REFERENCES workspaces(id)
                                   ON DELETE CASCADE,

                           CONSTRAINT fk_document_creator
                               FOREIGN KEY (created_by)
                                   REFERENCES users(id),

                           CONSTRAINT chk_document_title
                               CHECK (LENGTH(TRIM(title)) > 0)
);

CREATE INDEX idx_documents_workspace_id
    ON documents(workspace_id);

CREATE INDEX idx_documents_created_by
    ON documents(created_by);

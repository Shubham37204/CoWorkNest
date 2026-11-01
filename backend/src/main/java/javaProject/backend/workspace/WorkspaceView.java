package javaProject.backend.workspace;
import java.time.OffsetDateTime;
public record WorkspaceView(
        Long id,
        String name,
        String description,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        WorkspaceRole role) {

    static WorkspaceView of(Workspace w, WorkspaceRole role) {
        return new WorkspaceView(
                w.getId(), w.getName(), w.getDescription(),
                w.getCreatedAt(), w.getUpdatedAt(), role);
    }
}

package javaProject.backend.workspace;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class WorkspaceMemberId implements Serializable {

    @Column(name = "workspace_id", nullable = false)
    private Long workspaceId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    protected WorkspaceMemberId() {
    }

    public WorkspaceMemberId(Long workspaceId, Long userId) {
        this.workspaceId = workspaceId;
        this.userId = userId;
    }

    public Long getWorkspaceId() {
        return workspaceId;
    }

    public Long getUserId() {
        return userId;
    }

    @Override
    public boolean equals(Object object) {
        if (this == object) return true;
        if (!(object instanceof WorkspaceMemberId other)) return false;

        return Objects.equals(workspaceId, other.workspaceId)
                && Objects.equals(userId, other.userId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(workspaceId, userId);
    }
}

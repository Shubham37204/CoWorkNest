package javaProject.backend.workspace;
import java.time.OffsetDateTime;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;

import javaProject.backend.user.AppUser;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "workspace_members")
public class WorkspaceMember {

    @EmbeddedId
    private WorkspaceMemberId id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("workspaceId")
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private AppUser user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private WorkspaceRole role;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;

    protected WorkspaceMember() {
    }

    public WorkspaceMember(
            Workspace workspace,
            AppUser user,
            WorkspaceRole role
    ) {
        this.workspace = workspace;
        this.user = user;
        this.id = new WorkspaceMemberId(
                workspace.getId(),
                user.getId()
        );
        this.role = role;
    }

    public WorkspaceMemberId getId() {
        return id;
    }

    public Workspace getWorkspace() {
        return workspace;
    }

    public AppUser getUser() {
        return user;
    }

    public WorkspaceRole getRole() {
        return role;
    }

    public void setRole(WorkspaceRole role) {
        this.role = role;
    }

    public OffsetDateTime getJoinedAt() {
        return joinedAt;
    }
}

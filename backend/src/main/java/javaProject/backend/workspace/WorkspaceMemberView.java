package javaProject.backend.workspace;
import java.time.OffsetDateTime;

public record WorkspaceMemberView(
        Long userId,
        String email,
        String displayName,
        WorkspaceRole role,
        OffsetDateTime joinedAt
) {
    static WorkspaceMemberView of(WorkspaceMember member) {
        return new WorkspaceMemberView(
                member.getUser().getId(),
                member.getUser().getEmail(),
                member.getUser().getDisplayName(),
                member.getRole(),
                member.getJoinedAt()
        );
    }
}
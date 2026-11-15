
package javaProject.backend.workspace.dto;
import java.time.OffsetDateTime;
import javaProject.backend.workspace.WorkspaceMember;
import javaProject.backend.workspace.WorkspaceRole;

public record WorkspaceMemberResponse(
        Long userId,
        String email,
        String displayName,
        WorkspaceRole role,
        OffsetDateTime joinedAt
) {

    public static WorkspaceMemberResponse from(
            WorkspaceMember member
    ) {
        return new WorkspaceMemberResponse(
                member.getUser().getId(),
                member.getUser().getEmail(),
                member.getUser().getDisplayName(),
                member.getRole(),
                member.getJoinedAt()
        );
    }
}

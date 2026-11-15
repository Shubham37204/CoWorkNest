package javaProject.backend.workspace.dto;
import jakarta.validation.constraints.NotNull;
import javaProject.backend.workspace.WorkspaceRole;

public record UpdateMemberRoleRequest(

        @NotNull(message = "Member role is required")
        WorkspaceRole role

) {}

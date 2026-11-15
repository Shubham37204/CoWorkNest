package javaProject.backend.workspace.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import javaProject.backend.workspace.WorkspaceRole;

public record AddMemberRequest(

        @NotBlank(message = "Email is required")
        @Email(message = "Please provide a valid email")
        String email,

        @NotNull(message = "Member role is required")
        WorkspaceRole role

) {}

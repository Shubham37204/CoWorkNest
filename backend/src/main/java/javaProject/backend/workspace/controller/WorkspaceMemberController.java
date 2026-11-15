package javaProject.backend.workspace.controller;
import java.security.Principal;
import java.util.List;
import jakarta.validation.Valid;
import javaProject.backend.workspace.dto.AddMemberRequest;
import javaProject.backend.workspace.dto.UpdateMemberRoleRequest;
import javaProject.backend.workspace.dto.WorkspaceMemberResponse;
import javaProject.backend.workspace.service.WorkspaceMemberService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/members")
public class WorkspaceMemberController {

    private final WorkspaceMemberService memberService;

    public WorkspaceMemberController(
            WorkspaceMemberService memberService
    ) {
        this.memberService = memberService;
    }

    // Add member
    @PostMapping
    public ResponseEntity<WorkspaceMemberResponse> addMember(
            @PathVariable Long workspaceId,
            @Valid @RequestBody AddMemberRequest request,
            Principal principal
    ) {

        WorkspaceMemberResponse response =
                memberService.addMember(
                        principal.getName(),
                        workspaceId,
                        request
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // List workspace members
    @GetMapping
    public ResponseEntity<List<WorkspaceMemberResponse>> listMembers(
            @PathVariable Long workspaceId,
            Principal principal
    ) {

        return ResponseEntity.ok(
                memberService.listMembers(
                        principal.getName(),
                        workspaceId
                )
        );
    }

    // Change member role
    @PatchMapping("/{userId}")
    public ResponseEntity<WorkspaceMemberResponse> updateMemberRole(
            @PathVariable Long workspaceId,
            @PathVariable Long userId,
            @Valid @RequestBody UpdateMemberRoleRequest request,
            Principal principal
    ) {

        return ResponseEntity.ok(
                memberService.updateMemberRole(
                        principal.getName(),
                        workspaceId,
                        userId,
                        request
                )
        );
    }

    // Remove member
    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long userId,
            Principal principal
    ) {

        memberService.removeMember(
                principal.getName(),
                workspaceId,
                userId
        );

        return ResponseEntity.noContent().build();
    }
}

package javaProject.backend.workspace.service;
import java.util.List;
import java.util.Locale;
import javaProject.backend.user.AppUser;
import javaProject.backend.user.UserRepository;
import javaProject.backend.workspace.WorkspaceMember;
import javaProject.backend.workspace.WorkspaceMemberId;
import javaProject.backend.workspace.WorkspaceMemberRepository;
import javaProject.backend.workspace.WorkspaceRole;
import javaProject.backend.workspace.dto.AddMemberRequest;
import javaProject.backend.workspace.dto.UpdateMemberRoleRequest;
import javaProject.backend.workspace.dto.WorkspaceMemberResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkspaceMemberService {

    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public WorkspaceMemberService(
            WorkspaceMemberRepository memberRepository,
            UserRepository userRepository
    ) {
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    // 1. Add an existing user to a workspace
    @Transactional
    public WorkspaceMemberResponse addMember(
            String ownerEmail,
            Long workspaceId,
            AddMemberRequest request
    ) {

        WorkspaceMember ownerMembership =
                findMembership(ownerEmail, workspaceId);

        requireOwner(ownerMembership);

        if (request.role() == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OWNER role cannot be assigned through this endpoint"
            );
        }

        String memberEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        AppUser user = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registered user not found"
                ));

        WorkspaceMemberId membershipId =
                new WorkspaceMemberId(workspaceId, user.getId());

        if (memberRepository.existsById(membershipId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User is already a member of this workspace"
            );
        }

        WorkspaceMember newMember = new WorkspaceMember(
                ownerMembership.getWorkspace(),
                user,
                request.role()
        );

        WorkspaceMember savedMember =
                memberRepository.saveAndFlush(newMember);

        return WorkspaceMemberResponse.from(savedMember);
    }

    // 2. List all members of a workspace
    @Transactional(readOnly = true)
    public List<WorkspaceMemberResponse> listMembers(
            String requesterEmail,
            Long workspaceId
    ) {

        WorkspaceMember requesterMembership =
                findMembership(requesterEmail, workspaceId);

        // OWNER, EDITOR and VIEWER can view the member list.
        return memberRepository
                .findAllWithUserByWorkspaceId(workspaceId)
                .stream()
                .map(WorkspaceMemberResponse::from)
                .toList();
    }

    // 3. Update a member's role
    @Transactional
    public WorkspaceMemberResponse updateMemberRole(
            String ownerEmail,
            Long workspaceId,
            Long targetUserId,
            UpdateMemberRoleRequest request
    ) {

        WorkspaceMember ownerMembership =
                findMembership(ownerEmail, workspaceId);

        requireOwner(ownerMembership);

        if (request.role() == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OWNER role cannot be assigned through this endpoint"
            );
        }

        WorkspaceMemberId targetId =
                new WorkspaceMemberId(workspaceId, targetUserId);

        WorkspaceMember targetMember =
                memberRepository.findById(targetId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Workspace member not found"
                        ));

        if (targetMember.getRole() == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Workspace owner role cannot be changed"
            );
        }

        targetMember.setRole(request.role());

        WorkspaceMember savedMember =
                memberRepository.saveAndFlush(targetMember);

        return WorkspaceMemberResponse.from(savedMember);
    }

    // 4. Remove a member from a workspace
    @Transactional
    public void removeMember(
            String ownerEmail,
            Long workspaceId,
            Long targetUserId
    ) {

        WorkspaceMember ownerMembership =
                findMembership(ownerEmail, workspaceId);

        requireOwner(ownerMembership);

        WorkspaceMemberId targetId =
                new WorkspaceMemberId(workspaceId, targetUserId);

        WorkspaceMember targetMember =
                memberRepository.findById(targetId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Workspace member not found"
                        ));

        if (targetMember.getRole() == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Workspace owner cannot be removed"
            );
        }

        memberRepository.delete(targetMember);
    }

    // Find authenticated user's membership
    private WorkspaceMember findMembership(
            String email,
            Long workspaceId
    ) {

        AppUser user = userRepository.findByEmail(
                email.trim().toLowerCase(Locale.ROOT)
        ).orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Authenticated user not found"
        ));

        return memberRepository
                .findWithWorkspace(workspaceId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Workspace not found"
                ));
    }

    // OWNER authorization
    private void requireOwner(WorkspaceMember membership) {

        if (membership.getRole() != WorkspaceRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only workspace owner can perform this action"
            );
        }
    }
}

package javaProject.backend.workspace;
import java.util.List;
import javaProject.backend.user.AppUser;
import javaProject.backend.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;

@Service
public class WorkspaceService {

    private static final int MAX_NAME_LENGTH = 150;
    private static final int MAX_DESCRIPTION_LENGTH = 1000;

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository memberRepository;
    private final UserRepository userRepository;

    public WorkspaceService(
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository memberRepository,
            UserRepository userRepository
    ) {
        this.workspaceRepository = workspaceRepository;
        this.memberRepository = memberRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WorkspaceView create(String email, String name, String description) {
        AppUser user = findUser(email);
        String cleanName = requireValidName(name);
        String cleanDescription = normalizeDescription(description);

        Workspace workspace = workspaceRepository.saveAndFlush(
                new Workspace(cleanName, cleanDescription)
        );
        memberRepository.save(new WorkspaceMember(workspace, user, WorkspaceRole.OWNER));

        return WorkspaceView.of(workspace, WorkspaceRole.OWNER);
    }

    @Transactional
    public WorkspaceMemberView addMember(
            String ownerEmail,
            Long workspaceId,
            AddWorkspaceMemberRequest request
    ) {
        // 1. Verify that the current user belongs to the workspace.
        WorkspaceMember ownerMembership =
                findMembership(ownerEmail, workspaceId);

        // 2. Only OWNER can add members.
        requireOwner(ownerMembership);

        // 3. OWNER cannot be assigned through this endpoint.
        if (request.role() == WorkspaceRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "OWNER role cannot be assigned through this endpoint"
            );
        }

        // 4. Normalize the email.
        String memberEmail = request.email()
                .trim()
                .toLowerCase(Locale.ROOT);

        // 5. Find the registered user.
        AppUser user = userRepository.findByEmail(memberEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Registered user not found"
                ));

        // 6. Check whether the user is already a member.
        WorkspaceMemberId membershipId = new WorkspaceMemberId(
                workspaceId,
                user.getId()
        );

        if (memberRepository.existsById(membershipId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "User is already a member of this workspace"
            );
        }

        // 7. Create and save membership.
        WorkspaceMember newMember = new WorkspaceMember(
                ownerMembership.getWorkspace(),
                user,
                request.role()
        );

        WorkspaceMember savedMember =
                memberRepository.saveAndFlush(newMember);

        // 8. Return member details.
        return WorkspaceMemberView.of(savedMember);
    }

    @Transactional(readOnly = true)
    public List<WorkspaceView> listMine(String email) {
        AppUser user = findUser(email);

        return memberRepository.findAllWithWorkspaceByUserId(user.getId())
                .stream()
                .map(m -> WorkspaceView.of(m.getWorkspace(), m.getRole()))
                .toList();
    }

    @Transactional(readOnly = true)
    public WorkspaceView getMine(String email, Long workspaceId) {
        WorkspaceMember membership = findMembership(email, workspaceId);
        return WorkspaceView.of(membership.getWorkspace(), membership.getRole());
    }

    @Transactional
    public WorkspaceView rename(
            String email,
            Long workspaceId,
            String name,
            String description
    ) {
        WorkspaceMember membership = findMembership(email, workspaceId);
        requireOwner(membership);

        // Validate after authorization: non-members always get 404, whatever the payload.
        String cleanName = requireValidName(name);
        String cleanDescription = normalizeDescription(description);

        Workspace workspace = membership.getWorkspace();
        workspace.setName(cleanName);
        workspace.setDescription(cleanDescription);

        // Flush so @UpdateTimestamp runs and the returned updatedAt is current.
        workspaceRepository.saveAndFlush(workspace);
        return WorkspaceView.of(workspace, membership.getRole());
    }

    @Transactional
    public void delete(String email, Long workspaceId) {
        WorkspaceMember membership = findMembership(email, workspaceId);
        requireOwner(membership);

        // Members first. The bulk delete clears the persistence context, so the loaded
        // membership no longer references the workspace when it is removed.
        // deleteAllByWorkspaceId has no authorization of its own: call it only after requireOwner.
        memberRepository.deleteAllByWorkspaceId(workspaceId);
        workspaceRepository.deleteById(workspaceId);
    }

    private AppUser findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));
    }

    private WorkspaceMember findMembership(String email, Long workspaceId) {
        AppUser user = findUser(email);

        // Not a member and no such workspace look identical: 404, never 403.
        return memberRepository
                .findWithWorkspace(workspaceId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Workspace not found"
                ));
    }

    private void requireOwner(WorkspaceMember membership) {
        if (membership.getRole() != WorkspaceRole.OWNER) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Only the workspace owner can perform this action"
            );
        }
    }

    private static String requireValidName(String name) {
        if (name == null || name.isBlank()) {
            throw badRequest("Workspace name is required");
        }
        String clean = name.trim();
        if (clean.length() > MAX_NAME_LENGTH) {
            throw badRequest("Workspace name must be at most " + MAX_NAME_LENGTH + " characters");
        }
        return clean;
    }

    private static String normalizeDescription(String description) {
        if (description == null || description.isBlank()) {
            return null;
        }
        String clean = description.trim();
        if (clean.length() > MAX_DESCRIPTION_LENGTH) {
            throw badRequest(
                    "Workspace description must be at most " + MAX_DESCRIPTION_LENGTH + " characters");
        }
        return clean;
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }
}

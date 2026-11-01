package javaProject.backend.workspace;
import java.util.List;
import javaProject.backend.user.UserRepository;
import javaProject.backend.user.AppUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class WorkspaceService {

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
    public WorkspaceView create(
            String email,
            String name,
            String description
    ) {
        AppUser user = findUser(email);

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Workspace name is required"
            );
        }

        String cleanName = name.trim();

        if (cleanName.length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Workspace name must be at most 150 characters"
            );
        }

        Workspace workspace = workspaceRepository.saveAndFlush(
                new Workspace(cleanName, description)
        );

        WorkspaceMember owner = new WorkspaceMember(
                workspace,
                user,
                WorkspaceRole.OWNER
        );

        memberRepository.save(owner);

        return WorkspaceView.of(workspace, WorkspaceRole.OWNER);
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

        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Workspace name is required"
            );
        }

        if (name.trim().length() > 150) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Workspace name must be at most 150 characters"
            );
        }

        Workspace workspace = membership.getWorkspace();
        workspace.setName(name.trim());
        workspace.setDescription(description);

        workspaceRepository.saveAndFlush(workspace);
        return WorkspaceView.of(workspace, membership.getRole());
    }

    @Transactional
    public void delete(String email, Long workspaceId) {
        WorkspaceMember membership = findMembership(email, workspaceId);
        requireOwner(membership);

        workspaceRepository.delete(membership.getWorkspace());
    }

    private AppUser findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));
    }

    private WorkspaceMember findMembership(
            String email,
            Long workspaceId
    ) {
        AppUser user = findUser(email);

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
}

package javaProject.backend.workspace;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService) {
        this.workspaceService = workspaceService;
    }

    public record WorkspaceRequest(
            @NotBlank
            @Size(max = 150)
            String name,

            @Size(max = 1000)
            String description
    ) {}

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkspaceView create(
            Authentication authentication,
            @Valid @RequestBody WorkspaceRequest request
    ) {
        return workspaceService.create(
                authentication.getName(),
                request.name(),
                request.description()
        );
    }

    @GetMapping
    public List<WorkspaceView> listMine(
            Authentication authentication
    ) {
        return workspaceService.listMine(authentication.getName());
    }

    @GetMapping("/{workspaceId}")
    public WorkspaceView get(
            Authentication authentication,
            @PathVariable Long workspaceId
    ) {
        return workspaceService.getMine(
                authentication.getName(),
                workspaceId
        );
    }

    @PatchMapping("/{workspaceId}")
    public WorkspaceView rename(
            Authentication authentication,
            @PathVariable Long workspaceId,
            @Valid @RequestBody WorkspaceRequest request
    ) {
        return workspaceService.rename(
                authentication.getName(),
                workspaceId,
                request.name(),
                request.description()
        );
    }

    @DeleteMapping("/{workspaceId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            Authentication authentication,
            @PathVariable Long workspaceId
    ) {
        workspaceService.delete(
                authentication.getName(),
                workspaceId
        );
    }
}

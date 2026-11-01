package javaProject.backend.workspace;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface WorkspaceMemberRepository
        extends JpaRepository<WorkspaceMember, WorkspaceMemberId> {

    @Query("""
            select m from WorkspaceMember m
            join fetch m.workspace w
            where m.user.id = :userId
            order by w.createdAt desc
            """)
    List<WorkspaceMember> findAllWithWorkspaceByUserId(@Param("userId") Long userId);

    @Query("""
            select m from WorkspaceMember m
            join fetch m.workspace
            where m.workspace.id = :workspaceId and m.user.id = :userId
            """)
    Optional<WorkspaceMember> findWithWorkspace(
            @Param("workspaceId") Long workspaceId,
            @Param("userId") Long userId);
}
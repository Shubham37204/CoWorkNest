package javaProject.backend.document.repository;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import javaProject.backend.document.entity.Document;

public interface DocumentRepository
        extends JpaRepository<Document, Long> {

    // Get all documents belonging to a workspace
    List<Document> findAllByWorkspace_IdOrderByUpdatedAtDesc(
            Long workspaceId
    );

    // Find a document inside a particular workspace
    Optional<Document> findByIdAndWorkspace_Id(
            Long documentId,
            Long workspaceId
    );

    // Check whether a document belongs to a workspace
    boolean existsByIdAndWorkspace_Id(
            Long documentId,
            Long workspaceId
    );

    // Count documents in a workspace
    long countByWorkspace_Id(Long workspaceId);
}

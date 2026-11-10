package javaProject.backend.document.service;

import java.util.List;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javaProject.backend.document.dto.CreateDocumentRequest;
import javaProject.backend.document.dto.DocumentResponse;
import javaProject.backend.document.dto.UpdateDocumentRequest;
import javaProject.backend.document.entity.Document;
import javaProject.backend.document.repository.DocumentRepository;
import javaProject.backend.user.AppUser;
import javaProject.backend.user.AppUserRepository;
import javaProject.backend.workspace.Workspace;
import javaProject.backend.workspace.WorkspaceMember;
import javaProject.backend.workspace.WorkspaceMemberRepository;
import javaProject.backend.workspace.WorkspaceRepository;
import javaProject.backend.workspace.WorkspaceRole;

@Service
@Transactional(readOnly = true)
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final AppUserRepository appUserRepository;

    public DocumentService(
            DocumentRepository documentRepository,
            WorkspaceRepository workspaceRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            AppUserRepository appUserRepository
    ) {
        this.documentRepository = documentRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.appUserRepository = appUserRepository;
    }

    // Get authenticated user
    private AppUser getCurrentUser(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AccessDeniedException("Authentication required");
        }

        String email = authentication.getName();

        return appUserRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() ->
                        new AccessDeniedException("User not found"));
    }

    // Verify workspace membership
    private WorkspaceMember getMembership(
            Long workspaceId,
            Long userId
    ) {
        return workspaceMemberRepository
                .findWithWorkspace(workspaceId, userId)
                .orElseThrow(() ->
                        new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.NOT_FOUND,
                                "Workspace not found"
                        ));
    }

    // Verify write permission
    private void requireWritePermission(WorkspaceRole role) {

        if (role == WorkspaceRole.VIEWER) {
            throw new AccessDeniedException(
                    "You do not have permission to modify documents"
            );
        }
    }

    // Create document
    @Transactional
    public DocumentResponse createDocument(
            Long workspaceId,
            CreateDocumentRequest request,
            Authentication authentication
    ) {

        AppUser currentUser = getCurrentUser(authentication);

        WorkspaceMember membership = getMembership(
                workspaceId,
                currentUser.getId()
        );

        requireWritePermission(membership.getRole());

        String title = request.title().trim();

        if (title.isBlank()) {
            throw new IllegalArgumentException(
                    "Document title cannot be blank"
            );
        }

        Workspace workspace = membership.getWorkspace();

        String description = request.description();

        Document document = new Document(
                workspace,
                currentUser,
                title,
                description == null ? null : description.trim()
        );

        Document savedDocument = documentRepository.save(document);

        return toResponse(savedDocument);
    }

    // Get all documents in workspace
    public List<DocumentResponse> getDocuments(
            Long workspaceId,
            Authentication authentication
    ) {

        AppUser currentUser = getCurrentUser(authentication);

        getMembership(workspaceId, currentUser.getId());

        return documentRepository
                .findAllByWorkspace_IdOrderByUpdatedAtDesc(workspaceId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // Get single document
    public DocumentResponse getDocument(
            Long workspaceId,
            Long documentId,
            Authentication authentication
    ) {

        AppUser currentUser = getCurrentUser(authentication);

        getMembership(workspaceId, currentUser.getId());

        Document document = findDocument(workspaceId, documentId);

        return toResponse(document);
    }

    // Update document
    @Transactional
    public DocumentResponse updateDocument(
            Long workspaceId,
            Long documentId,
            UpdateDocumentRequest request,
            Authentication authentication
    ) {

        AppUser currentUser = getCurrentUser(authentication);

        WorkspaceMember membership = getMembership(
                workspaceId,
                currentUser.getId()
        );

        requireWritePermission(membership.getRole());

        if (request.title() == null && request.description() == null) {
            throw new IllegalArgumentException(
                    "At least one field must be provided"
            );
        }

        Document document = findDocument(workspaceId, documentId);

        if (request.title() != null) {
            String title = request.title().trim();

            if (title.isBlank()) {
                throw new IllegalArgumentException(
                        "Document title cannot be blank"
                );
            }

            document.setTitle(title);
        }

        if (request.description() != null) {
            document.setDescription(request.description().trim());
        }

        return toResponse(documentRepository.save(document));
    }

    // Delete document
    @Transactional
    public void deleteDocument(
            Long workspaceId,
            Long documentId,
            Authentication authentication
    ) {

        AppUser currentUser = getCurrentUser(authentication);

        WorkspaceMember membership = getMembership(
                workspaceId,
                currentUser.getId()
        );

        requireWritePermission(membership.getRole());

        Document document = findDocument(workspaceId, documentId);

        documentRepository.delete(document);
    }

    // Find document within workspace
    private Document findDocument(
            Long workspaceId,
            Long documentId
    ) {
        return documentRepository
                .findByIdAndWorkspace_Id(documentId, workspaceId)
                .orElseThrow(() ->
                        new org.springframework.web.server.ResponseStatusException(
                                org.springframework.http.HttpStatus.NOT_FOUND,
                                "Document not found"
                        ));
    }

    // Convert entity to DTO
    private DocumentResponse toResponse(Document document) {

        return new DocumentResponse(
                document.getId(),
                document.getWorkspace().getId(),
                document.getTitle(),
                document.getDescription(),
                document.getCreatedBy().getId(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }
}

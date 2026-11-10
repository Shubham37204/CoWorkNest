package javaProject.backend.document.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javaProject.backend.document.dto.CreateDocumentRequest;
import javaProject.backend.document.dto.DocumentResponse;
import javaProject.backend.document.dto.UpdateDocumentRequest;
import javaProject.backend.document.service.DocumentService;

@RestController
@RequestMapping("/api/workspaces/{workspaceId}/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    // Create document
    @PostMapping
    public ResponseEntity<DocumentResponse> createDocument(
            @PathVariable Long workspaceId,
            @Valid @RequestBody CreateDocumentRequest request,
            Authentication authentication
    ) {
        DocumentResponse response = documentService.createDocument(
                workspaceId,
                request,
                authentication
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Get all documents
    @GetMapping
    public ResponseEntity<List<DocumentResponse>> getDocuments(
            @PathVariable Long workspaceId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                documentService.getDocuments(workspaceId, authentication)
        );
    }

    // Get document by ID
    @GetMapping("/{documentId}")
    public ResponseEntity<DocumentResponse> getDocument(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                documentService.getDocument(
                        workspaceId,
                        documentId,
                        authentication
                )
        );
    }

    // Update document
    @PatchMapping("/{documentId}")
    public ResponseEntity<DocumentResponse> updateDocument(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,
            @Valid @RequestBody UpdateDocumentRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                documentService.updateDocument(
                        workspaceId,
                        documentId,
                        request,
                        authentication
                )
        );
    }

    // Delete document
    @DeleteMapping("/{documentId}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long workspaceId,
            @PathVariable Long documentId,
            Authentication authentication
    ) {
        documentService.deleteDocument(
                workspaceId,
                documentId,
                authentication
        );

        return ResponseEntity.noContent().build();
    }
}

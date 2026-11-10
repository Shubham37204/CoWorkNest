package javaProject.backend.document.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateDocumentRequest(

        @NotBlank(message = "Document title is required")
        @Size(max = 150, message = "Document title cannot exceed 150 characters")
        String title,

        @Size(max = 500, message = "Description cannot exceed 500 characters")
        String description

) {}
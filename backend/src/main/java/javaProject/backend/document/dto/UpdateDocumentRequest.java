package javaProject.backend.document.dto;

import jakarta.validation.constraints.Size;

public record UpdateDocumentRequest(

        @Size(min = 1, max = 150,
                message = "Document title must be between 1 and 150 characters")
        String title,

        @Size(max = 500,
                message = "Description cannot exceed 500 characters")
        String description

) {}
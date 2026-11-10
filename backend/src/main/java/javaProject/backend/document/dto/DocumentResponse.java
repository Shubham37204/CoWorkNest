package javaProject.backend.document.dto;

import java.time.OffsetDateTime;

public record DocumentResponse(

        Long id,
        Long workspaceId,
        String title,
        String description,
        Long createdBy,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt

) {}
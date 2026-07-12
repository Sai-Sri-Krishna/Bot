package com.nec.faq.dto;

import java.time.LocalDateTime;
import java.util.List;

public record FaqDto(
    Long id,
    String question,
    String answer,
    String category,
    List<String> aliases,
    LocalDateTime createdAt,
    LocalDateTime updatedAt
) {}

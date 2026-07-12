package com.nec.faq.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record FaqRequest(
    @NotBlank(message = "Question is required")
    @Size(max = 1000)
    String question,

    @NotBlank(message = "Answer is required")
    String answer,

    @NotBlank(message = "Category is required")
    String category,

    List<String> aliases
) {}

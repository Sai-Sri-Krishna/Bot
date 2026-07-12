package com.nec.session;

import com.nec.faq.FaqEntry;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession session;

    /** USER or ASSISTANT */
    @Column(nullable = false, length = 20)
    private String sender;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String text;

    /** LOCAL, GEMINI, FALLBACK, WELCOME */
    @Column(length = 30)
    private String source;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matched_faq_id")
    private FaqEntry matchedFaq;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}

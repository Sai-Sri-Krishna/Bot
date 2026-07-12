package com.nec.faq;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "faq_aliases")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FaqAlias {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "faq_entry_id", nullable = false)
    private FaqEntry faqEntry;

    @Column(name = "alias_text", nullable = false, columnDefinition = "TEXT")
    private String aliasText;
}

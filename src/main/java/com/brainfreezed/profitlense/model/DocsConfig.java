package com.brainfreezed.profitlense.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "docs_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocsConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Builder.Default
    @Column(name = "is_visible")
    private Boolean isVisible = true;

    @Column(name = "visible_from")
    private LocalDateTime visibleFrom;

    @Column(name = "visible_until")
    private LocalDateTime visibleUntil;

    @Column(name = "pitch_text", columnDefinition = "TEXT")
    private String pitchText;

    @Column(name = "tech_text", columnDefinition = "TEXT")
    private String techText;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

package com.brainfreezed.profitlense.repository;

import com.brainfreezed.profitlense.model.DocsConfig;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DocsConfigRepository extends JpaRepository<DocsConfig, UUID> {
}

package com.cafeleaf.repository;

import com.cafeleaf.entity.JournalEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface JournalEntryRepository extends JpaRepository<JournalEntry, Long> {
    List<JournalEntry> findByUserIdOrderByRecordedAtDesc(Long userId);
}
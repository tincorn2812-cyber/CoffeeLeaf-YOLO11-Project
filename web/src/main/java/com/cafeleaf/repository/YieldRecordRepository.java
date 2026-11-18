package com.cafeleaf.repository;

import com.cafeleaf.entity.YieldRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface YieldRecordRepository extends JpaRepository<YieldRecord, Long> {
    List<YieldRecord> findByUserIdOrderByRecordedAtDesc(Long userId);
}
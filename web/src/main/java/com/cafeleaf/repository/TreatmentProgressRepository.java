package com.cafeleaf.repository;

import com.cafeleaf.entity.TreatmentProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TreatmentProgressRepository extends JpaRepository<TreatmentProgress, Long> {
    List<TreatmentProgress> findByUserId(Long userId);
    Optional<TreatmentProgress> findByUserIdAndDiseaseIdAndStepIndex(Long userId, String diseaseId, Integer stepIndex);
}
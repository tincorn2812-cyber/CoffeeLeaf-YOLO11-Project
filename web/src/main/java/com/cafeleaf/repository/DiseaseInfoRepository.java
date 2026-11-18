package com.cafeleaf.repository;

import com.cafeleaf.entity.DiseaseInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DiseaseInfoRepository extends JpaRepository<DiseaseInfo, String> {
    List<DiseaseInfo> findAllByOrderByDisplayOrderAsc();
}
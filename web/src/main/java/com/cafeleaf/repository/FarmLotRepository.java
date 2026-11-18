package com.cafeleaf.repository;

import com.cafeleaf.entity.FarmLot;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FarmLotRepository extends JpaRepository<FarmLot, Long> {
    List<FarmLot> findByUserIdOrderByLotIndexAsc(Long userId);
}
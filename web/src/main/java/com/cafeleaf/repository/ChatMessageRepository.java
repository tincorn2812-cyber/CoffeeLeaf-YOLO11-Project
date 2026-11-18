package com.cafeleaf.repository;

import com.cafeleaf.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);
    List<ChatMessage> findTop30ByUserIdOrderByCreatedAtAsc(Long userId);
}
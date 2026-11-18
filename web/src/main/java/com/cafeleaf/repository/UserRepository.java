package com.cafeleaf.repository;

import com.cafeleaf.dto.UserQuickSummary;
import com.cafeleaf.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    // Giữ tương thích ngược nếu còn lời gọi cũ
    default Optional<User> findByEmailIgnoreCase(String email) { return findByEmail(email); }
    default Optional<User> findByUsernameIgnoreCase(String username) { return findByUsername(username); }
    default boolean existsByEmailIgnoreCase(String email) { return existsByEmail(email); }
    default boolean existsByUsernameIgnoreCase(String username) { return existsByUsername(username); }

    @Query("SELECT u.email AS email, u.username AS username, u.fullName AS fullName, u.province AS province FROM User u")
    List<UserQuickSummary> findAllQuickSummaries();
}
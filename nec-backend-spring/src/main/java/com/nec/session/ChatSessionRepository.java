package com.nec.session;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatSessionRepository extends JpaRepository<ChatSession, Long> {

    @Query("SELECT s FROM ChatSession s LEFT JOIN FETCH s.user ORDER BY s.startedAt DESC")
    List<ChatSession> findAllWithUser();
}

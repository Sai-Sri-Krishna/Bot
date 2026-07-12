package com.nec.faq;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaqRepository extends JpaRepository<FaqEntry, Long> {

    @Query("SELECT f FROM FaqEntry f ORDER BY f.category, f.id")
    List<FaqEntry> findAllOrderedByCategoryAndId();
}

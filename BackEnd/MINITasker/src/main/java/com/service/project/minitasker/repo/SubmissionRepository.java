package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    boolean existsByTask_IdAndUser_Id(Long id, Long currentUserId);

    List<Submission> findByUserId(Long userId);
}

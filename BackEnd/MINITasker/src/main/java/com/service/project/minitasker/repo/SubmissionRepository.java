package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Submission;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
}

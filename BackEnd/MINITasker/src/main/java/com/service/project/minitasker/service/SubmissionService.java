package com.service.project.minitasker.service;

import com.service.project.minitasker.dto.SubmissionDTO;
import com.service.project.minitasker.entity.Submission;

import java.util.List;
import java.util.Optional;

public interface SubmissionService {
    Submission createSubmission(SubmissionDTO submission);

    // Get all submissions
    List<Submission> getAllSubmissions();

    // Get a submission by ID
    Optional<Submission> getSubmissionById(Long id);

    // Update a submission
    Submission updateSubmission(Long id, SubmissionDTO submission);

    // Delete a submission
    void deleteSubmission(Long id);
}

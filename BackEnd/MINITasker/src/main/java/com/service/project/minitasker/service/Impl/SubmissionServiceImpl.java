package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.dto.SubmissionDTO;
import com.service.project.minitasker.entity.Submission;
import com.service.project.minitasker.entity.Task;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.repo.SubmissionRepository;
import com.service.project.minitasker.repo.TaskRepository;
import com.service.project.minitasker.repo.UserRepository;
import com.service.project.minitasker.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    public Submission createSubmission(SubmissionDTO dto) {
        // Validate Task
        Task task = taskRepository.findById(dto.getTaskId())
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + dto.getTaskId()));

        // Validate Worker
        User worker = userRepository.findById(dto.getWorkerId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getWorkerId()));

        // Build Submission entity
        Submission submission = new Submission();
        submission.setTask(task);
        submission.setUser(worker);
        submission.setProofUrl(dto.getProofUrl());
        submission.setStatus(dto.getStatus());
        submission.setReviewComment(dto.getReviewComment());
        submission.setDescription(dto.getDescription());

        return submissionRepository.save(submission);
    }

    @Override
    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    @Override
    public Optional<Submission> getSubmissionById(Long id) {
        return submissionRepository.findById(id);
    }

    @Override
    public Submission updateSubmission(Long id, SubmissionDTO dto) {
        return submissionRepository.findById(id).map(existing -> {

            // Update Task if provided
            if (dto.getTaskId() != null) {
                Task task = taskRepository.findById(dto.getTaskId())
                        .orElseThrow(() -> new RuntimeException("Task not found with ID: " + dto.getTaskId()));
                existing.setTask(task);
            }

            // Update Worker if provided
            if (dto.getWorkerId() != null) {
                User worker = userRepository.findById(dto.getWorkerId())
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + dto.getWorkerId()));
                existing.setUser(worker);
            }

            if (dto.getProofUrl() != null) existing.setProofUrl(dto.getProofUrl());
            if (dto.getStatus() != null) existing.setStatus(dto.getStatus());
            if (dto.getReviewComment() != null) existing.setReviewComment(dto.getReviewComment());
            if (dto.getDescription() != null) existing.setDescription(dto.getDescription());

            return submissionRepository.save(existing);
        }).orElseThrow(() -> new RuntimeException("Submission not found with id: " + id));
    }

    @Override
    public void deleteSubmission(Long id) {
        if (!submissionRepository.existsById(id)) {
            throw new RuntimeException("Submission not found with id: " + id);
        }
        submissionRepository.deleteById(id);
    }
    @Override
    public List<Task> getAllSubmittedTasksByUser(Long userId) {
        List<Submission> submissions = submissionRepository.findByUserId(userId);
        return submissions.stream().map(sub -> {
            Task task = sub.getTask();
            task.setSubmissionStatus(sub.getStatus()); // attach submission status
            return task;
        }).toList();
    }

}

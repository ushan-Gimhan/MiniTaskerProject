package com.service.project.minitasker.service.Impl;

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
    public Submission createSubmission(Submission submission) {
        // Validate Task
        Task task = taskRepository.findById(Math.toIntExact(submission.getTask().getId()))
                .orElseThrow(() -> new RuntimeException("Task not found with ID: " + submission.getTask().getId()));

        // Validate Worker/User
        User worker = userRepository.findById(submission.getWorker().getId())
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + submission.getWorker().getId()));

        // Assign back to make sure we use the managed entities
        submission.setTask(task);
        submission.setWorker(worker);

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
    public Submission updateSubmission(Long id, Submission submission) {
        return submissionRepository.findById(id).map(existing -> {
            // Validate Task if changed
            if (submission.getTask() != null) {
                Task task = taskRepository.findById(Math.toIntExact(submission.getTask().getId()))
                        .orElseThrow(() -> new RuntimeException("Task not found with ID: " + submission.getTask().getId()));
                existing.setTask(task);
            }

            // Validate Worker if changed
            if (submission.getWorker() != null) {
                User worker = userRepository.findById(submission.getWorker().getId())
                        .orElseThrow(() -> new RuntimeException("User not found with ID: " + submission.getWorker().getId()));
                existing.setWorker(worker);
            }

            existing.setProofUrl(submission.getProofUrl());
            existing.setStatus(submission.getStatus());
            existing.setReviewComment(submission.getReviewComment());
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
}

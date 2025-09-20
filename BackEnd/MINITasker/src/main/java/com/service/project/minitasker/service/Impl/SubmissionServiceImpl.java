package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.dto.SubmissionDTO;
import com.service.project.minitasker.entity.*;
import com.service.project.minitasker.repo.*;
import com.service.project.minitasker.service.SubmissionService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TaskRepository taskRepository;
    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final NotifyRepository notifyRepository;

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

    @Transactional
    public Submission updateSubmissionStatus(Long submissionId, String newStatus) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        Task task = submission.getTask();
        User user = submission.getUser();

        if(task == null || user == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Submission missing task or user");
        }


        submission.setStatus(newStatus);

        if ("APPROVED".equalsIgnoreCase(newStatus)) {
            // 1️⃣ Update Wallet
            Wallet wallet = user.getWallet();
            wallet.setBalance(wallet.getBalance() + task.getRewardPerTask());
            wallet.setType("earned");
            walletRepository.save(wallet);

            user.setWalletBalance(wallet.getBalance());
            userRepository.save(user);

            // 2️⃣ Update Task available count
            if (task.getAvailableQuantity() > 0) {
                task.setAvailableQuantity(task.getAvailableQuantity() - 1);
                taskRepository.save(task);
            }

            // 3️⃣ Create Notification
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setMessage("🎉 Your submission for task '" + task.getTitle() + "' was approved! Reward credited.");
            notifyRepository.save(notification);
        }

        return submissionRepository.save(submission);
    }

}

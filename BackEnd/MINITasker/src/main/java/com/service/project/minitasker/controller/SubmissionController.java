package com.service.project.minitasker.controller;

import com.service.project.minitasker.dto.SubmissionDTO;
import com.service.project.minitasker.entity.Submission;
import com.service.project.minitasker.entity.Task;
import com.service.project.minitasker.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/submission")
@RequiredArgsConstructor
@CrossOrigin("*")
public class SubmissionController {

    private final SubmissionService submissionService;

    @PostMapping("/create")
    public ResponseEntity<Submission> createSubmission(@RequestBody SubmissionDTO submission) {
        return ResponseEntity.ok(submissionService.createSubmission(submission));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionService.getAllSubmissions());
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
        return submissionService.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Submission> updateSubmission(@PathVariable Long id, @RequestBody SubmissionDTO submission) {
        return ResponseEntity.ok(submissionService.updateSubmission(id, submission));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        submissionService.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tasks/user/{userId}")
    public ResponseEntity<List<Task>> getAllSubmittedTasksByUser(@PathVariable Long userId) {
        List<Task> tasks = submissionService.getAllSubmittedTasksByUser(userId);

        if (tasks.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(tasks);
    }
}

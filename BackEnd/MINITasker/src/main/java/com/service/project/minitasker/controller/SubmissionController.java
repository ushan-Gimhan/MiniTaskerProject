package com.service.project.minitasker.controller;

import com.service.project.minitasker.entity.Submission;
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

    private final SubmissionService submissionServiceImpl;

    @PostMapping("/create")
    public ResponseEntity<Submission> createSubmission(@RequestBody Submission submission) {
        return ResponseEntity.ok(submissionServiceImpl.createSubmission(submission));
    }

    @GetMapping("/getAll")
    public ResponseEntity<List<Submission>> getAllSubmissions() {
        return ResponseEntity.ok(submissionServiceImpl.getAllSubmissions());
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<Submission> getSubmissionById(@PathVariable Long id) {
        return submissionServiceImpl.getSubmissionById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Submission> updateSubmission(@PathVariable Long id, @RequestBody Submission submission) {
        return ResponseEntity.ok(submissionServiceImpl.updateSubmission(id, submission));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteSubmission(@PathVariable Long id) {
        submissionServiceImpl.deleteSubmission(id);
        return ResponseEntity.noContent().build();
    }
}

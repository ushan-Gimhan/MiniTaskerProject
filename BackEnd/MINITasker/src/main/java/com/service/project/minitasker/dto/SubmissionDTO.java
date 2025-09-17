package com.service.project.minitasker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionDTO {
    private Long taskId;        // reference to Task
    private Long workerId;      // reference to User (worker)

    private String proofUrl;
    private String status;      // PENDING, APPROVED, REJECTED
    private String reviewComment;
    private String description;
}

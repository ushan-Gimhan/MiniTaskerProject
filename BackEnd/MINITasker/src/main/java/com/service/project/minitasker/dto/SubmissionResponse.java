package com.service.project.minitasker.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmissionResponse {
    private int status;
    private String message;

    public SubmissionResponse(SubmissionResponse response) {
        this.status = response.status;
        this.message = response.message;
    }
}

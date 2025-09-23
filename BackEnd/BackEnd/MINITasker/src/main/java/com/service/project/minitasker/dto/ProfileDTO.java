package com.service.project.minitasker.dto;

import com.service.project.minitasker.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileDTO {
    private String userId;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private String location;
}

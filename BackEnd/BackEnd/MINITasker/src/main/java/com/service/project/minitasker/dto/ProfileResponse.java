package com.service.project.minitasker.dto;

import com.service.project.minitasker.entity.Profile;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProfileResponse {
    private Long status;
    private String message;
    private Profile profile;
}

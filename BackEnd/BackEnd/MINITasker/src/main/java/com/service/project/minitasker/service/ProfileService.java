package com.service.project.minitasker.service;

import com.service.project.minitasker.dto.ProfileDTO;
import com.service.project.minitasker.entity.Profile;
import com.service.project.minitasker.entity.User;

public interface ProfileService {
    Profile getProfileByUser(User user);

    Profile createOrUpdateProfile(User user, ProfileDTO dto);

    Profile getProfileByUserId(Long userId);
}

package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.dto.ProfileDTO;
import com.service.project.minitasker.entity.Profile;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.repo.ProfileRepository;
import com.service.project.minitasker.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {
    private final ProfileRepository profileRepository;

    @Override
    public Profile getProfileByUser(User user) {
        return profileRepository.findByUser(user)
                .orElse(null); // Return null if not found (you can also throw a custom exception)
    }

    @Override
    public Profile createOrUpdateProfile(User user, ProfileDTO dto) {
        // 🔎 Check if a profile already exists for this user
        Optional<Profile> optionalProfile = profileRepository.findByUser(user);

        Profile profile;
        if (optionalProfile.isPresent()) {
            // ✅ Update existing profile
            profile = optionalProfile.get();
            profile.setFullName(dto.getFullName());
            profile.setAvatarUrl(dto.getAvatarUrl());
            profile.setBio(dto.getBio());
            profile.setLocation(dto.getLocation());
        } else {
            // ✅ Create new profile
            profile = Profile.builder()
                    .user(user)
                    .fullName(dto.getFullName())
                    .avatarUrl(dto.getAvatarUrl())
                    .bio(dto.getBio())
                    .location(dto.getLocation())
                    .build();
        }
        System.out.println(dto.getAvatarUrl());
        return profileRepository.save(profile); // Save new or updated profile
    }

    @Override
    public Profile getProfileByUserId(Long userId) {
        return profileRepository.findByUserId(userId);
    }
}

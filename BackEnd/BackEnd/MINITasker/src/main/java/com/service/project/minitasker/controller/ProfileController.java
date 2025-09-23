package com.service.project.minitasker.controller;

import com.service.project.minitasker.dto.ProfileDTO;
import com.service.project.minitasker.dto.ProfileResponse;
import com.service.project.minitasker.entity.Profile;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.service.AuthService;
import com.service.project.minitasker.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/profile")
@RequiredArgsConstructor
@CrossOrigin("*")
public class ProfileController {

    private final ProfileService profileService;
    private final AuthService authService;

    // ✅ Create profile
    @PostMapping("/create")
    public ResponseEntity<ProfileResponse> createProfile(@RequestBody ProfileDTO profileDTO) {
        User user = authService.getUserById(profileDTO.getUserId());
        System.out.println(user);// You can also resolve from Authentication
        Profile createdProfile = profileService.createOrUpdateProfile(user, profileDTO);
        return ResponseEntity.ok(
                new ProfileResponse(200L, "Profile created successfully", createdProfile)
        );
    }

    // ✅ Update profile
    @PostMapping("/update")
    public ResponseEntity<ProfileResponse> updateProfile(@RequestBody ProfileDTO profileDTO) {
        User user = authService.getUserById(profileDTO.getUserId());
        Profile updatedProfile = profileService.createOrUpdateProfile(user, profileDTO);
        return ResponseEntity.ok(
                new ProfileResponse(200L, "Profile updated successfully", updatedProfile)
        );
    }

    @GetMapping("/get/{userId}")
    public ResponseEntity<Profile> getProfileByUserId(@PathVariable Long userId) {
        Profile profile = profileService.getProfileByUserId(userId);
        return ResponseEntity.ok(profile);
    }
}

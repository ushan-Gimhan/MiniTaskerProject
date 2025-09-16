package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Profile findByUserId(Long id);
}

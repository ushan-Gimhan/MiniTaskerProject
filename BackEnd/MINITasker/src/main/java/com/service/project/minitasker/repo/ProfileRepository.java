package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Profile;
import com.service.project.minitasker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Profile findByUserId(Long id);

    Optional<Profile> findByUser(User user);
}

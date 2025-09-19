package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Profile;
import com.service.project.minitasker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<Profile, Integer> {
    Profile findByUserId(Long id);
    Optional<Profile> findByUser(User user);
}

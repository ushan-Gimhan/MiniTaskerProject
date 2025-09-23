package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotifyRepository extends JpaRepository<Notification,Long> {
    List<Notification> findByUserIdOrderByIdDesc(Long userId);
}

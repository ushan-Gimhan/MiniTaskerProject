package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Integer> {
    List<Task> findByStatusAndClientIdNot(String status, Long clientId);
    List<Task> findByClientId(Long clientId);
}

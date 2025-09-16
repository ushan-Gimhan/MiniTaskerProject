package com.service.project.minitasker.repo;

import com.service.project.minitasker.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TaskRepository extends JpaRepository<Task, Integer> {
}

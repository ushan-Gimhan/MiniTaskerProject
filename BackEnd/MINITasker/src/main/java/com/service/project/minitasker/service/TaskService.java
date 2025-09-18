package com.service.project.minitasker.service;
import com.service.project.minitasker.dto.TaskDTO;
import com.service.project.minitasker.entity.Task;

import java.util.List;

public interface TaskService {
    Task createTask(TaskDTO taskDTO, String imageName);
    List<Task> getAllTasks();
    Task getTaskById(Long id);

    List<Task> getAllApprovedTasks(Long id);
}

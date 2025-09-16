package com.service.project.minitasker.controller;

import com.service.project.minitasker.dto.TaskDTO;
import com.service.project.minitasker.dto.TaskResponse;
import com.service.project.minitasker.entity.Task;
import com.service.project.minitasker.service.Impl.TaskServiceImpl;
import com.service.project.minitasker.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")

public class TaskController {

    private final TaskService taskServiceImpl;

    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskDTO taskDTO) {
        Task createdTask = taskServiceImpl.createTask(taskDTO, taskDTO.getImageName());
        System.out.println(taskDTO.getClient());
        return ResponseEntity.ok(
                new TaskResponse(200L, "OK", createdTask)
        );
    }

    // ✅ Get all tasks
    @GetMapping("/getAll")
    public ResponseEntity<List<Task>> getAllTasks() {
        List<Task> tasks = taskServiceImpl.getAllTasks();
        return ResponseEntity.ok(tasks);
    }

    // ✅ Get task by ID
    @GetMapping("/get/{id}")
    public ResponseEntity<Task> getTaskById(@PathVariable Long id) {
        Task task = taskServiceImpl.getTaskById(id);
        return ResponseEntity.ok(task);
    }



}
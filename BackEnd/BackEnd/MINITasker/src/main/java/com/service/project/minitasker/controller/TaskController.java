package com.service.project.minitasker.controller;

import com.service.project.minitasker.dto.TaskDTO;
import com.service.project.minitasker.dto.TaskResponse;
import com.service.project.minitasker.entity.Task;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.service.AuthService;
import com.service.project.minitasker.service.TaskService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/task")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:63342")

public class TaskController {

    private final TaskService taskServiceImpl;
    private final AuthService authService;

    @PostMapping("/create")
    public ResponseEntity<TaskResponse> createTask(@RequestBody TaskDTO taskDTO) {
        Task createdTask = taskServiceImpl.createTask(taskDTO, taskDTO.getImageName());
        System.out.println(taskDTO);
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

    @PostMapping("/approved")
    public ResponseEntity<List<Task>> getAllApprovedTasks(@RequestBody User user) {
        User currentUser = authService.findByUsername(user.getUsername());
        List<Task> tasks = taskServiceImpl.getAllApprovedTasks(currentUser.getId());
        return ResponseEntity.ok(tasks);
    }

    // ✅ Get tasks by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Task>> getTasksByUserId(@PathVariable Long userId) {
        List<Task> tasks = taskServiceImpl.getTasksByUserId(userId);
        return ResponseEntity.ok(tasks);
    }

    // ✅ Update Task
    @PutMapping("/update/{id}")
    public ResponseEntity<Task> updateTask(@PathVariable Long id, @RequestBody Task updatedTask) {
        Task task = taskServiceImpl.updateTask(id, updatedTask);
        return ResponseEntity.ok(task);
    }


}
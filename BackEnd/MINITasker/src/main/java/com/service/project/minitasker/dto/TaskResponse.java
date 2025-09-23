package com.service.project.minitasker.dto;

import com.service.project.minitasker.entity.Task;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TaskResponse {
    private Long id;
    private String title;
    private String status;
    private String message;
    private Task task;

    public TaskResponse(long l, String ok, Task createdTask) {
        this.id=l;
        this.title=ok;
        this.status=ok;
        this.task=createdTask;
    }
}

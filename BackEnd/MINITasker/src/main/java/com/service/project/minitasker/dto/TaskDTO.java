package com.service.project.minitasker.dto;

import com.service.project.minitasker.entity.Payment;
import com.service.project.minitasker.entity.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.security.PrivilegedAction;
import java.util.Date;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskDTO {
    private String title;
    private String description;
    private Double rewardPerTask;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String imageName;
    private String status;
    private Double totalPrice;
    private String imageBase64;
    private User client;
    private List<PaymentDTO> payments;
}

package com.service.project.minitasker.service;

import com.service.project.minitasker.dto.AuthDTO;
import com.service.project.minitasker.dto.AuthResponseDTO;
import com.service.project.minitasker.dto.RegisterDTO;
import com.service.project.minitasker.entity.User;

import java.util.List;

public interface AuthService {
    AuthResponseDTO authenticate(AuthDTO authDTO);

    String register(RegisterDTO registerDTO);

    User findByUsername(String username);

    User getUserById(String userId);

    List<User> getAllUsers();
}

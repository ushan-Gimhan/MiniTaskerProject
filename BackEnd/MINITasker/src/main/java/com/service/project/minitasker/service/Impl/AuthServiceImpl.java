package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.dto.AuthDTO;
import com.service.project.minitasker.dto.AuthResponseDTO;
import com.service.project.minitasker.dto.RegisterDTO;
import com.service.project.minitasker.entity.Role;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.repo.UserRepository;
import com.service.project.minitasker.service.AuthService;
import com.service.project.minitasker.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthResponseDTO authenticate(AuthDTO authDTO){
        // validate credentials
        User user=userRepository.findByUsername(authDTO.getUsername())
                .orElseThrow(()->new RuntimeException("User not found"));
        // check password
        if (!passwordEncoder.matches(
                authDTO.getPassword(),
                user.getPassword())){
            throw new BadCredentialsException("Invalid credentials");
        }
        // generate token
        String token=jwtUtil.generateToken(authDTO.username,user.getRole().name());
        return new AuthResponseDTO(token);
    }
    // register user
    public String register(RegisterDTO registerDTO){
        if (userRepository.findByUsername(registerDTO.getUsername())
                .isPresent()){
            throw new RuntimeException("Username already exists");
        }
        System.out.println(registerDTO.getRole());
        User user=User.builder()
                .username(registerDTO.getUsername())
                .password(passwordEncoder.encode(registerDTO.getPassword()))
                .mobile(registerDTO.getMobile())
                .email(registerDTO.getEmail())
                .role(Role.valueOf(registerDTO.getRole()))
                .walletBalance(registerDTO.getWalletBalance())
                .build();
        userRepository.save(user);
        return "User registered successfully";
    }

    public User findByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            return userOpt.get();
        } else {
            throw new RuntimeException("User not found with username: " + username);
        }
    }

    @Override
    public User getUserById(String userId) {
        try {
            Long id = Long.parseLong(userId); // convert string to long
            Optional<User> optionalUser = userRepository.findById(id);
            if (optionalUser.isPresent()) {
                return optionalUser.get();
            } else {
                throw new RuntimeException("User not found with ID: " + userId);
            }
        } catch (NumberFormatException e) {
            throw new RuntimeException("Invalid user ID format: " + userId);
        }
    }

    @Override
    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll(); // fetch all users from DB
        if (users.isEmpty()) {
            throw new RuntimeException("No users found");
        }
        return users;
    }

}

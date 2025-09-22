package com.service.project.minitasker.service.Impl;

import com.service.project.minitasker.entity.EmailConfirmationToken;
import com.service.project.minitasker.entity.User;
import com.service.project.minitasker.repo.EmailTokenRepository;
import com.service.project.minitasker.repo.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    private final EmailTokenRepository emailTokenRepository;

    private final UserRepository userRepository;

    public void sendEmail(String toEmail, String subject, String body) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("kavinducoc49@gmail.com"); // or your app email
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(body);
        mailSender.send(message);
    }

    @Transactional
    public String confirmEmail(String token) {
        EmailConfirmationToken confirmationToken = emailTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (confirmationToken.isConfirmed()) {
            throw new RuntimeException("Email already confirmed");
        }

        // Mark token as confirmed
        confirmationToken.setConfirmed(true);
        emailTokenRepository.save(confirmationToken);

        // Activate the user
        User user = confirmationToken.getUser();
        user.setEnabled(true);
        userRepository.save(user);

        return "Email confirmed successfully";
    }
}


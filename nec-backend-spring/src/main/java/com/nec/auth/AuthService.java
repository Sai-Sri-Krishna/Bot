package com.nec.auth;

import com.nec.auth.dto.AuthResponse;
import com.nec.auth.dto.LoginRequest;
import com.nec.user.User;
import com.nec.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );

        User user = (User) auth.getPrincipal();
        String token = jwtService.generateToken(user.getEmail(), user.getRole());

        return new AuthResponse(token, user.getRole(), user.getName(), user.getEmail());
    }

    public AuthResponse guestLogin() {
        String token = jwtService.generateGuestToken();
        return new AuthResponse(token, "GUEST", "Guest User", "guest@nec.local");
    }

    public AuthResponse me(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String token = jwtService.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getRole(), user.getName(), user.getEmail());
    }
}

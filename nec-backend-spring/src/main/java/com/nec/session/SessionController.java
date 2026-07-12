package com.nec.session;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
public class SessionController {

    private final ChatSessionRepository sessionRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getSessions() {
        List<Map<String, Object>> sessions = sessionRepository.findAllWithUser()
                .stream()
                .map(s -> Map.<String, Object>of(
                        "id", s.getId(),
                        "isGuest", s.getIsGuest(),
                        "userEmail", s.getUser() != null ? s.getUser().getEmail() : "guest",
                        "startedAt", s.getStartedAt().toString(),
                        "messageCount", s.getMessages().size()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(sessions);
    }
}

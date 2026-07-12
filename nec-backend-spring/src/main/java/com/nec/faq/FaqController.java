package com.nec.faq;

import com.nec.faq.dto.FaqDto;
import com.nec.faq.dto.FaqRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/faqs")
@RequiredArgsConstructor
public class FaqController {

    private final FaqService faqService;

    /** Public — Angular FAQ tab and FastAPI both use this */
    @GetMapping
    public ResponseEntity<List<FaqDto>> getAll() {
        return ResponseEntity.ok(faqService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<FaqDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(faqService.getById(id));
    }

    /** Admin-only — create, update, delete */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FaqDto> create(@Valid @RequestBody FaqRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(faqService.create(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FaqDto> update(@PathVariable Long id,
                                          @Valid @RequestBody FaqRequest request) {
        return ResponseEntity.ok(faqService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        faqService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

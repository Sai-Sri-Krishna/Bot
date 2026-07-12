package com.nec.faq;

import com.nec.faq.dto.FaqDto;
import com.nec.faq.dto.FaqRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FaqService {

    private final FaqRepository faqRepository;

    public List<FaqDto> getAll() {
        return faqRepository.findAllOrderedByCategoryAndId()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public FaqDto getById(Long id) {
        return faqRepository.findById(id)
                .map(this::toDto)
                .orElseThrow(() -> new NoSuchElementException("FAQ not found: " + id));
    }

    @Transactional
    public FaqDto create(FaqRequest request) {
        FaqEntry entry = FaqEntry.builder()
                .question(request.question())
                .answer(request.answer())
                .category(request.category())
                .build();

        if (request.aliases() != null) {
            request.aliases().stream()
                    .filter(a -> a != null && !a.isBlank())
                    .map(a -> FaqAlias.builder().faqEntry(entry).aliasText(a.trim()).build())
                    .forEach(entry.getAliases()::add);
        }

        return toDto(faqRepository.save(entry));
    }

    @Transactional
    public FaqDto update(Long id, FaqRequest request) {
        FaqEntry entry = faqRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("FAQ not found: " + id));

        entry.setQuestion(request.question());
        entry.setAnswer(request.answer());
        entry.setCategory(request.category());

        entry.getAliases().clear();
        if (request.aliases() != null) {
            request.aliases().stream()
                    .filter(a -> a != null && !a.isBlank())
                    .map(a -> FaqAlias.builder().faqEntry(entry).aliasText(a.trim()).build())
                    .forEach(entry.getAliases()::add);
        }

        return toDto(faqRepository.save(entry));
    }

    @Transactional
    public void delete(Long id) {
        if (!faqRepository.existsById(id)) {
            throw new NoSuchElementException("FAQ not found: " + id);
        }
        faqRepository.deleteById(id);
    }

    private FaqDto toDto(FaqEntry entry) {
        List<String> aliases = entry.getAliases().stream()
                .map(FaqAlias::getAliasText)
                .collect(Collectors.toList());
        return new FaqDto(
                entry.getId(),
                entry.getQuestion(),
                entry.getAnswer(),
                entry.getCategory(),
                aliases,
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }
}

package com.team.backend.service;

import com.team.backend.dto.ApplicationDto;
import com.team.backend.entity.Application;
import com.team.backend.entity.enums.ApplicationStatus;
import com.team.backend.repository.ApplicationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    private final ApplicationRepository repository;

    @Value("${app.upload.dir:./uploads/cv}")
    private String uploadDir;

    public ApplicationService(ApplicationRepository repository) {
        this.repository = repository;
    }

    public List<ApplicationDto> findAll() {
        return repository.findAll()
                .stream()
                .map(ApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ApplicationDto findById(Long id) {
        Application app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée avec l'id: " + id));
        return ApplicationDto.fromEntity(app);
    }

    public List<ApplicationDto> findByCandidateId(Long candidateId) {
        return repository.findByCandidateId(candidateId)
                .stream()
                .map(ApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public List<ApplicationDto> findByJobOfferId(Long jobOfferId) {
        return repository.findByJobOfferId(jobOfferId)
                .stream()
                .map(ApplicationDto::fromEntity)
                .collect(Collectors.toList());
    }

    public ApplicationDto create(ApplicationDto dto) {
        if (dto.getCandidateId() == null || dto.getJobOfferId() == null) {
            throw new IllegalArgumentException("candidateId et jobOfferId sont obligatoires.");
        }

        if (repository.existsByCandidateIdAndJobOfferId(dto.getCandidateId(), dto.getJobOfferId())) {
            throw new IllegalArgumentException("Vous avez déjà postulé à cette offre d'emploi.");
        }

        Application application = dto.toEntity();
        if (application.getStatus() == null) {
            application.setStatus(ApplicationStatus.SUBMITTED);
        }
        if (application.getApplicationDate() == null) {
            application.setApplicationDate(LocalDateTime.now());
        }

        Application saved = repository.save(application);
        return ApplicationDto.fromEntity(saved);
    }

    public ApplicationDto updateStatus(Long id, ApplicationStatus status) {
        Application app = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Candidature non trouvée avec l'id: " + id));
        app.setStatus(status);
        Application updated = repository.save(app);
        return ApplicationDto.fromEntity(updated);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new IllegalArgumentException("Candidature non trouvée avec l'id: " + id);
        }
        repository.deleteById(id);
    }

    public String storeCv(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Le fichier CV ne peut pas être vide.");
        }

        String originalFileName = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv.pdf"
        );

        String extension = "";
        int dotIndex = originalFileName.lastIndexOf(".");
        if (dotIndex >= 0) {
            extension = originalFileName.substring(dotIndex);
        }

        String storedFileName = UUID.randomUUID().toString() + extension;

        try {
            Path targetDir = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(storedFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            return "/uploads/cv/" + storedFileName;
        } catch (IOException ex) {
            throw new RuntimeException("Échec de l'enregistrement du fichier CV: " + ex.getMessage(), ex);
        }
    }
}

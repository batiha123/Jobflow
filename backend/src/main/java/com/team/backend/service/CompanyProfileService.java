package com.team.backend.service;

import com.team.backend.dto.CompanyProfileRequest;
import com.team.backend.dto.CompanyProfileResponse;
import com.team.backend.entity.CompanyProfile;
import com.team.backend.repository.CompanyProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CompanyProfileService {

    private static final Logger logger = LoggerFactory.getLogger(CompanyProfileService.class);

    private final CompanyProfileRepository companyProfileRepository;
    private final CurrentUserProvider currentUserProvider;
    private final LogoStorageService logoStorageService;

    public CompanyProfileService(
            CompanyProfileRepository companyProfileRepository,
            CurrentUserProvider currentUserProvider,
            LogoStorageService logoStorageService) {
        this.companyProfileRepository = companyProfileRepository;
        this.currentUserProvider = currentUserProvider;
        this.logoStorageService = logoStorageService;
    }

    @Transactional(readOnly = true)
    public CompanyProfileResponse getMyProfile() {
        Long userId = currentUserProvider.getCurrentUserId();
        CompanyProfile companyProfile = companyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Company profile not found"));

        return toResponse(companyProfile);
    }

    @Transactional(readOnly = true)
    public List<CompanyProfileResponse> getPublicProfiles() {
        return companyProfileRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CompanyProfileResponse createMyProfile(CompanyProfileRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        if (companyProfileRepository.existsByUserId(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Company profile already exists");
        }

        CompanyProfile companyProfile = new CompanyProfile(
                userId,
                request.getCompanyName(),
                request.getDescription(),
                request.getAddress(),
                request.getWebsite(),
                null);

        return toResponse(companyProfileRepository.save(companyProfile));
    }

    @Transactional
    public CompanyProfileResponse updateMyProfile(CompanyProfileRequest request) {
        Long userId = currentUserProvider.getCurrentUserId();
        CompanyProfile companyProfile = companyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Company profile not found"));

        companyProfile.setCompanyName(request.getCompanyName());
        companyProfile.setDescription(request.getDescription());
        companyProfile.setAddress(request.getAddress());
        companyProfile.setWebsite(request.getWebsite());

        return toResponse(companyProfileRepository.save(companyProfile));
    }

    @Transactional
    public CompanyProfileResponse uploadMyLogo(MultipartFile file) {
        Long userId = currentUserProvider.getCurrentUserId();
        CompanyProfile companyProfile = companyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Company profile not found"));

        String oldLogoUrl = companyProfile.getLogoUrl();
        String newLogoUrl = logoStorageService.storeLogo(file);
        try {
            companyProfile.setLogoUrl(newLogoUrl);
            CompanyProfile savedProfile = companyProfileRepository.save(companyProfile);
            registerLogoReplacementCleanup(newLogoUrl, oldLogoUrl);
            return toResponse(savedProfile);
        } catch (RuntimeException exception) {
            try {
                logoStorageService.deleteLogo(newLogoUrl);
            } catch (RuntimeException cleanupException) {
                exception.addSuppressed(cleanupException);
            }
            throw exception;
        }
    }

    @Transactional
    public CompanyProfileResponse deleteMyLogo() {
        Long userId = currentUserProvider.getCurrentUserId();
        CompanyProfile companyProfile = companyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Company profile not found"));

        String oldLogoUrl = companyProfile.getLogoUrl();
        companyProfile.setLogoUrl(null);
        CompanyProfile savedProfile = companyProfileRepository.save(companyProfile);
        registerLogoDeletionAfterCommit(oldLogoUrl);
        return toResponse(savedProfile);
    }

    private void registerLogoReplacementCleanup(String newLogoUrl, String oldLogoUrl) {
        ensureTransactionSynchronizationActive();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deleteLogoAfterCommit(oldLogoUrl);
            }

            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    deleteLogoAfterRollback(newLogoUrl);
                }
            }
        });
    }

    private void registerLogoDeletionAfterCommit(String logoUrl) {
        if (logoUrl == null) {
            return;
        }
        ensureTransactionSynchronizationActive();
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                deleteLogoAfterCommit(logoUrl);
            }
        });
    }

    private void ensureTransactionSynchronizationActive() {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            throw new IllegalStateException("Logo cleanup requires an active transaction");
        }
    }

    private void deleteLogoAfterCommit(String logoUrl) {
        if (logoUrl == null) {
            return;
        }
        try {
            logoStorageService.deleteLogo(logoUrl);
        } catch (RuntimeException exception) {
            logger.error("Unable to delete superseded company logo after transaction commit: {}", logoUrl, exception);
        }
    }

    private void deleteLogoAfterRollback(String logoUrl) {
        try {
            logoStorageService.deleteLogo(logoUrl);
        } catch (RuntimeException exception) {
            logger.error("Unable to delete uncommitted company logo after transaction rollback: {}", logoUrl, exception);
        }
    }

    private CompanyProfileResponse toResponse(CompanyProfile companyProfile) {
        CompanyProfileResponse response = new CompanyProfileResponse();
        response.setId(companyProfile.getId());
        response.setCompanyName(companyProfile.getCompanyName());
        response.setDescription(companyProfile.getDescription());
        response.setAddress(companyProfile.getAddress());
        response.setWebsite(companyProfile.getWebsite());
        response.setLogoUrl(companyProfile.getLogoUrl());
        response.setCreatedAt(companyProfile.getCreatedAt());
        response.setUpdatedAt(companyProfile.getUpdatedAt());
        return response;
    }
}

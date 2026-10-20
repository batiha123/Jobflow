package com.team.backend.service;

import com.team.backend.dto.ApplicationResponseDTO;
import com.team.backend.dto.ApplyRequest;
import com.team.backend.dto.InterviewDTO;
import com.team.backend.dto.TestAttemptDTO;
import com.team.backend.entity.*;
import com.team.backend.entity.enums.ApplicationStatus;
import com.team.backend.entity.enums.InterviewStatus;
import com.team.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApplicationService {

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private CandidateProfileRepository candidateProfileRepository;

    @Autowired
    private CompanyProfileRepository companyProfileRepository;

    @Autowired
    private JobOfferRepository jobOfferRepository;

    @Autowired
    private InterviewRepository interviewRepository;

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private TestAttemptRepository testAttemptRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public ApplicationResponseDTO apply(ApplyRequest req) {
        if (req.getUserId() == null || req.getJobOfferId() == null) {
            throw new RuntimeException("Paramètres de candidature incomplets.");
        }

        // 1. Get or create candidate profile for user
        CandidateProfile candidate = candidateProfileRepository.findByUserId(req.getUserId())
                .orElseGet(() -> {
                    CandidateProfile newProf = new CandidateProfile();
                    newProf.setUserId(req.getUserId());
                    return candidateProfileRepository.save(newProf);
                });

        // 2. Verify candidate hasn't already applied
        if (applicationRepository.existsByCandidateIdAndJobOfferId(candidate.getId(), req.getJobOfferId())) {
            throw new RuntimeException("Vous avez déjà soumis votre candidature pour cette offre d'emploi !");
        }

        // 3. Verify job offer exists
        JobOffer job = jobOfferRepository.findById(req.getJobOfferId())
                .orElseThrow(() -> new RuntimeException("Offre d'emploi introuvable."));

        // 4. Save new application
        Application app = new Application();
        app.setCandidateId(candidate.getId());
        app.setJobOfferId(req.getJobOfferId());
        app.setMotivationMessage(req.getMotivationMessage());
        app.setCvUrl(req.getCvUrl() != null && !req.getCvUrl().trim().isEmpty() ? req.getCvUrl() : "https://jobflow.com/resumes/mon-cv.pdf");
        app.setStatus(ApplicationStatus.SUBMITTED);

        Application saved = applicationRepository.save(app);

        return toDTO(saved, candidate, job);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getCandidateApplications(Long userId) {
        Optional<CandidateProfile> candOpt = candidateProfileRepository.findByUserId(userId);
        if (candOpt.isEmpty()) {
            return Collections.emptyList();
        }

        CandidateProfile candidate = candOpt.get();
        List<Application> apps = applicationRepository.findByCandidateIdOrderByApplicationDateDesc(candidate.getId());

        return apps.stream().map(app -> {
            JobOffer job = jobOfferRepository.findById(app.getJobOfferId()).orElse(null);
            return toDTO(app, candidate, job);
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponseDTO> getCompanyApplications(Long companyUserId) {
        Optional<CompanyProfile> compOpt = companyProfileRepository.findByUserId(companyUserId);
        if (compOpt.isEmpty()) {
            return Collections.emptyList();
        }

        CompanyProfile company = compOpt.get();
        List<JobOffer> offers = jobOfferRepository.findByCompanyIdOrderByCreatedAtDesc(company.getId());
        if (offers.isEmpty()) {
            return Collections.emptyList();
        }

        List<ApplicationResponseDTO> result = new ArrayList<>();
        for (JobOffer job : offers) {
            List<Application> apps = applicationRepository.findByJobOfferIdOrderByApplicationDateDesc(job.getId());
            for (Application app : apps) {
                CandidateProfile candidate = candidateProfileRepository.findById(app.getCandidateId()).orElse(null);
                result.add(toDTO(app, candidate, job));
            }
        }
        return result;
    }

    @Transactional
    public ApplicationResponseDTO updateApplicationStatus(Long applicationId, String statusStr) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        try {
            app.setStatus(ApplicationStatus.valueOf(statusStr.toUpperCase()));
        } catch (Exception e) {
            throw new RuntimeException("Statut invalide : " + statusStr);
        }

        Application updated = applicationRepository.save(app);
        CandidateProfile candidate = candidateProfileRepository.findById(updated.getCandidateId()).orElse(null);
        JobOffer job = jobOfferRepository.findById(updated.getJobOfferId()).orElse(null);
        return toDTO(updated, candidate, job);
    }

    @Transactional
    public ApplicationResponseDTO scheduleInterview(Long applicationId, InterviewDTO dto) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        Interview interview = interviewRepository.findByApplicationId(applicationId)
                .orElseGet(() -> {
                    Interview newI = new Interview();
                    newI.setApplicationId(applicationId);
                    return newI;
                });

        interview.setScheduledAt(dto.getScheduledAt() != null ? dto.getScheduledAt() : LocalDateTime.now().plusDays(2));
        interview.setLocation(dto.getLocation() != null ? dto.getLocation() : "Google Meet");
        interview.setMeetingUrl(dto.getMeetingUrl() != null ? dto.getMeetingUrl() : "https://meet.google.com/jobflow-interview");
        interview.setNotes(dto.getNotes() != null ? dto.getNotes() : "Entretien RH & Technique (45 min)");
        interview.setStatus(InterviewStatus.SCHEDULED);

        interviewRepository.save(interview);

        app.setStatus(ApplicationStatus.SHORTLISTED);
        Application updated = applicationRepository.save(app);

        CandidateProfile candidate = candidateProfileRepository.findById(updated.getCandidateId()).orElse(null);
        JobOffer job = jobOfferRepository.findById(updated.getJobOfferId()).orElse(null);
        return toDTO(updated, candidate, job);
    }

    @Transactional
    public ApplicationResponseDTO withdrawApplication(Long applicationId, Long userId) {
        CandidateProfile candidate = candidateProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Profil candidat introuvable"));

        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Candidature introuvable"));

        if (!app.getCandidateId().equals(candidate.getId())) {
            throw new RuntimeException("Action non autorisée sur cette candidature.");
        }

        app.setStatus(ApplicationStatus.WITHDRAWN);
        Application updated = applicationRepository.save(app);

        JobOffer job = jobOfferRepository.findById(app.getJobOfferId()).orElse(null);
        return toDTO(updated, candidate, job);
    }

    public ApplicationResponseDTO toDTO(Application app, CandidateProfile candidate, JobOffer job) {
        ApplicationResponseDTO dto = new ApplicationResponseDTO();
        dto.setId(app.getId());
        dto.setCandidateId(app.getCandidateId());
        dto.setJobOfferId(app.getJobOfferId());
        dto.setStatus(app.getStatus().name());
        dto.setMotivationMessage(app.getMotivationMessage());
        dto.setCvUrl(app.getCvUrl());
        dto.setApplicationDate(app.getApplicationDate());

        // Candidate details
        if (candidate != null) {
            dto.setCandidateHeadline(candidate.getHeadline());
            userRepository.findById(candidate.getUserId()).ifPresent(u -> {
                dto.setCandidateName(u.getName());
                dto.setCandidateEmail(u.getEmail());
            });
        }

        // Job offer & company details
        if (job != null) {
            dto.setJobTitle(job.getTitle());
            dto.setLocation(job.getLocation());
            dto.setContractType(job.getContractType().name());
            dto.setSalaryMin(job.getSalaryMin());
            dto.setSalaryMax(job.getSalaryMax());

            companyProfileRepository.findById(job.getCompanyId()).ifPresent(comp -> {
                dto.setCompanyName(comp.getCompanyName());
                dto.setCompanyLogo(comp.getLogoUrl());
            });
        }

        // Interview if scheduled
        Optional<Interview> interviewOpt = interviewRepository.findByApplicationId(app.getId());
        if (interviewOpt.isPresent()) {
            Interview i = interviewOpt.get();
            InterviewDTO idto = new InterviewDTO();
            idto.setId(i.getId());
            idto.setApplicationId(i.getApplicationId());
            idto.setScheduledAt(i.getScheduledAt());
            idto.setLocation(i.getLocation());
            idto.setMeetingUrl(i.getMeetingUrl());
            idto.setNotes(i.getNotes());
            idto.setStatus(i.getStatus().name());
            dto.setInterview(idto);
        }

        // Test attempt if any
        Optional<TestAttempt> attemptOpt = testAttemptRepository.findByApplicationId(app.getId());
        if (attemptOpt.isPresent()) {
            TestAttempt ta = attemptOpt.get();
            TestAttemptDTO tadto = new TestAttemptDTO();
            tadto.setId(ta.getId());
            tadto.setTestId(ta.getTestId());
            tadto.setScore(ta.getScore());
            tadto.setStatus(ta.getStatus().name());
            tadto.setCompletedAt(ta.getCompletedAt());

            testRepository.findById(ta.getTestId()).ifPresent(t -> tadto.setTestTitle(t.getTitle()));
            dto.setTestAttempt(tadto);
        }

        return dto;
    }
}

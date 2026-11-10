package com.team.backend.dto;

import java.util.List;

public class AiAnalysisDto {

    // Request fields
    public static class Request {
        private String candidateSkills;
        private String jobRequirements;

        public Request() {}
        public Request(String candidateSkills, String jobRequirements) {
            this.candidateSkills = candidateSkills;
            this.jobRequirements = jobRequirements;
        }

        public String getCandidateSkills() { return candidateSkills; }
        public void setCandidateSkills(String candidateSkills) { this.candidateSkills = candidateSkills; }

        public String getJobRequirements() { return jobRequirements; }
        public void setJobRequirements(String jobRequirements) { this.jobRequirements = jobRequirements; }
    }

    // Response fields
    public static class Response {
        private int matchScore; // 0 to 100%
        private String matchLevel; // STRONG, MODERATE, LOW
        private List<String> matchedSkills;
        private List<String> missingSkills;
        private String summary;

        public Response() {}
        public Response(int matchScore, String matchLevel, List<String> matchedSkills, List<String> missingSkills, String summary) {
            this.matchScore = matchScore;
            this.matchLevel = matchLevel;
            this.matchedSkills = matchedSkills;
            this.missingSkills = missingSkills;
            this.summary = summary;
        }

        public int getMatchScore() { return matchScore; }
        public void setMatchScore(int matchScore) { this.matchScore = matchScore; }

        public String getMatchLevel() { return matchLevel; }
        public void setMatchLevel(String matchLevel) { this.matchLevel = matchLevel; }

        public List<String> getMatchedSkills() { return matchedSkills; }
        public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

        public List<String> getMissingSkills() { return missingSkills; }
        public void setMissingSkills(List<String> missingSkills) { this.missingSkills = missingSkills; }

        public String getSummary() { return summary; }
        public void setSummary(String summary) { this.summary = summary; }
    }
}
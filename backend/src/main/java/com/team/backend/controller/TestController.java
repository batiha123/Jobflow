package com.team.backend.controller;

import com.team.backend.dto.TestAttemptDTO;
import com.team.backend.dto.TestDTO;
import com.team.backend.service.TestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
public class TestController {

    @Autowired
    private TestService testService;

    @GetMapping
    public ResponseEntity<List<TestDTO>> getAllTests() {
        return ResponseEntity.ok(testService.getAllTests());
    }

    @GetMapping("/job/{jobOfferId}")
    public ResponseEntity<List<TestDTO>> getTestsForJob(@PathVariable Long jobOfferId) {
        return ResponseEntity.ok(testService.getTestsForJob(jobOfferId));
    }

    @PostMapping("/submit")
    public ResponseEntity<TestAttemptDTO> submitTest(@RequestBody Map<String, Object> body) {
        Long testId = Long.valueOf(body.get("testId").toString());
        Long applicationId = Long.valueOf(body.get("applicationId").toString());
        BigDecimal score = new BigDecimal(body.get("score").toString());

        TestAttemptDTO result = testService.submitAttempt(testId, applicationId, score);
        return ResponseEntity.ok(result);
    }
}

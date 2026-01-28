package com.bankingparser.controller;

import com.bankingparser.dto.RegexMatchRequest;
import com.bankingparser.dto.RegexMatchResponse;
import com.bankingparser.model.Pattern;
import com.bankingparser.service.PatternService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.regex.PatternSyntaxException;

@RestController
@RequestMapping("/maker")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('MAKER')")
public class MakerController {

    @Autowired
    private PatternService patternService;

    /**
     * Get all draft patterns
     * Endpoint: GET /maker/getDrafts
     */
    @GetMapping("/getDrafts")
    public ResponseEntity<List<Pattern>> getDrafts() {
        List<Pattern> drafts = patternService.getDrafts();
        return ResponseEntity.ok(drafts);
    }

    /**
     * Get all rejected patterns
     * Endpoint: GET /maker/getRejected
     */
    @GetMapping("/getRejected")
    public ResponseEntity<List<Pattern>> getRejected() {
        List<Pattern> rejected = patternService.getRejected();
        return ResponseEntity.ok(rejected);
    }

    /**
     * Get all failed patterns
     * Endpoint: GET /maker/getMsgsFailed
     */
    @GetMapping("/getMsgsFailed")
    public ResponseEntity<List<Pattern>> getMsgsFailed() {
        List<Pattern> failed = patternService.getFailed();
        return ResponseEntity.ok(failed);
    }

    /**
     * Post pattern and sample (submit for approval)
     * Endpoint: POST /maker/postPatternAndSample
     * This will create a pattern with status "PENDING" for checker approval
     */
    @PostMapping("/postPatternAndSample")
    public ResponseEntity<Pattern> postPatternAndSample(@RequestBody Pattern pattern) {
        // Set status to PENDING when maker submits for approval
        pattern.setStatus("PENDING");
        Pattern savedPattern = patternService.savePattern(pattern);
        return ResponseEntity.ok(savedPattern);
    }

    /**
     * Post pattern and sample as draft
     * Endpoint: POST /maker/postPatternAndSampleForDraft
     * This will create a pattern with status "DRAFT"
     */
    @PostMapping("/postPatternAndSampleForDraft")
    public ResponseEntity<Pattern> postPatternAndSampleForDraft(@RequestBody Pattern pattern) {
        // Set status to DRAFT when maker saves as draft
        pattern.setStatus("DRAFT");
        Pattern savedPattern = patternService.savePattern(pattern);
        return ResponseEntity.ok(savedPattern);
    }

    /**
     * Update an existing pattern (e.g., failed message with new regex)
     * Endpoint: PUT /maker/updatePattern/{patternId}
     * Used to update failed messages with a regex pattern
     */
    @PutMapping("/updatePattern/{patternId}")
    public ResponseEntity<?> updatePattern(
            @PathVariable Integer patternId,
            @RequestBody Pattern updatedPattern) {
        try {
            Pattern existingPattern = patternService.getPatternById(patternId)
                    .orElseThrow(() -> new RuntimeException("Pattern not found"));

            // Update the regex pattern
            if (updatedPattern.getRegexPattern() != null) {
                existingPattern.setRegexPattern(updatedPattern.getRegexPattern());
            }

            // Update the sample message if provided
            if (updatedPattern.getSampleEx() != null) {
                existingPattern.setSampleEx(updatedPattern.getSampleEx());
            }

            // Update the status
            if (updatedPattern.getStatus() != null) {
                existingPattern.setStatus(updatedPattern.getStatus());
            }

            Pattern savedPattern = patternService.savePattern(existingPattern);
            return ResponseEntity.ok(savedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating pattern: " + e.getMessage());
        }
    }



    // ============ DIRECT REGEX MATCHING (No Database) ============

    /**
     * DIRECT REGEX MATCHING - Give a pattern and string, check if they match
     * Endpoint: POST /maker/matchRegex
     *
     * Body: {
     *   "pattern": ".*credited.*Rs\\.\\s*(\\d+).*",
     *   "inputString": "Your account has been credited with Rs. 5000"
     * }
     *
     * Response: {
     *   "matched": true,
     *   "pattern": ".*credited.*Rs\\.\\s*(\\d+).*",
     *   "inputString": "Your account has been credited with Rs. 5000",
     *   "message": "Pattern matched successfully!",
     *   "capturedGroups": ["credited with Rs. 5000", "5000"]
     * }
     */
    @PostMapping("/matchRegex")
    public ResponseEntity<RegexMatchResponse> matchRegex(@Valid @RequestBody RegexMatchRequest request) {
        RegexMatchResponse result = patternService.matchRegex(request);
        return ResponseEntity.ok(result);
    }


}

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
import java.util.Map;

@RestController
@RequestMapping("/checker")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('CHECKER')")
public class CheckerController {

    @Autowired
    private PatternService patternService;

    /**
     * Get all pending patterns for approval
     * Endpoint: GET /checker/getPendings
     */
    @GetMapping("/getPendings")
    public ResponseEntity<List<Pattern>> getPendings() {
        List<Pattern> pendings = patternService.getPendings();
        return ResponseEntity.ok(pendings);
    }

    /**
     * Get all patterns (all statuses) for the All Templates view
     * Endpoint: GET /checker/getAllPatterns
     */
    @GetMapping("/getAllPatterns")
    public ResponseEntity<List<Pattern>> getAllPatterns() {
        List<Pattern> patterns = patternService.getAllPatterns();
        return ResponseEntity.ok(patterns);
    }

    /**
     * Approve or reject a pattern
     * Endpoint: POST /checker/postPatternAndSample
     * Body should contain: patternId and action (APPROVED/REJECTED)
     */
    @PostMapping("/postPatternAndSample")
    public ResponseEntity<?> postPatternAndSample(@RequestBody Map<String, Object> request) {
        try {
            Integer patternId = (Integer) request.get("patternId");
            String action = (String) request.get("action");

            Pattern pattern = patternService.getPatternById(patternId)
                    .orElseThrow(() -> new RuntimeException("Pattern not found"));

            // Update status based on checker's action
            if ("APPROVED".equalsIgnoreCase(action)) {
                pattern.setStatus("APPROVED");
            } else if ("REJECTED".equalsIgnoreCase(action)) {
                pattern.setStatus("REJECTED");
            } else {
                return ResponseEntity.badRequest().body("Invalid action. Use APPROVED or REJECTED");
            }

            Pattern updatedPattern = patternService.savePattern(pattern);
            return ResponseEntity.ok(updatedPattern);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error processing request: " + e.getMessage());
        }
    }



    // ============ DIRECT REGEX MATCHING (No Database) ============

    /**
     * DIRECT REGEX MATCHING - Give a pattern and string, check if they match
     * Endpoint: POST /checker/matchRegex
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

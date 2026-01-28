package com.bankingparser.service;

import com.bankingparser.dto.PatternMatchResult;
import com.bankingparser.dto.RegexMatchRequest;
import com.bankingparser.dto.RegexMatchResponse;
import com.bankingparser.model.Pattern;
import com.bankingparser.repository.PatternRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.PatternSyntaxException;

import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.regex.Matcher;
import java.util.regex.PatternSyntaxException;
import java.util.*;

@Service
public class PatternService {

    private static final Logger logger = LoggerFactory.getLogger(PatternService.class);

    @Autowired
    private PatternRepository patternRepository;

    public List<Pattern> getAllPatterns() {
        return patternRepository.findAll();
    }

    public Optional<Pattern> getPatternById(Integer id) {
        return patternRepository.findById(id);
    }

    public List<Pattern> getPatternsByStatus(String status) {
        return patternRepository.findByStatus(status);
    }

    public Pattern savePattern(Pattern pattern) {
        return patternRepository.save(pattern);
    }

    public void deletePattern(Integer id) {
        patternRepository.deleteById(id);
    }


    // Get drafts for maker
    public List<Pattern> getDrafts() {
        return patternRepository.findByStatus("DRAFT");
    }

    // Get rejected patterns for maker
    public List<Pattern> getRejected() {
        return patternRepository.findByStatus("REJECTED");
    }

    // Get failed patterns for maker
    public List<Pattern> getFailed() {
        return patternRepository.findByStatus("FAILED");
    }

    // Get pending patterns for checker
    public List<Pattern> getPendings() {
        return patternRepository.findByStatus("PENDING");
    }






    // ============ REGEX MATCHING METHODS ============

    /**
     * DIRECT REGEX MATCHING - No database involved!
     * Takes a pattern (regex) and input string, checks if they match
     * Supports named capturing groups for extracting specific fields like:
     * - bankName, accountNumber, transactionId, transactionType, amount, date, time, availableBalance
     *
     * @param request Contains pattern (regex) and inputString
     * @return RegexMatchResponse with match result, captured groups, and extracted fields
     */
    public RegexMatchResponse matchRegex(RegexMatchRequest request) {
        String patternStr = request.getPattern();
        String inputString = request.getInputString();

        System.out.println(patternStr);
        System.out.println(inputString);

        // Validate inputs
        if (patternStr == null || patternStr.trim().isEmpty()) {
            return new RegexMatchResponse(false, patternStr, inputString, "Pattern is empty");
        }

        if (inputString == null || inputString.trim().isEmpty()) {
            return new RegexMatchResponse(false, patternStr, inputString, "Input string is empty");
        }

        System.out.println("HIIIIII");

        try {
            // Compile the regex pattern
            java.util.regex.Pattern regex = java.util.regex.Pattern.compile(patternStr);

            System.out.println("HII in try");

            // Create matcher
            Matcher matcher = regex.matcher(inputString);
            System.out.println(matcher);

            // Try to find match
            if (matcher.find()) {
                System.out.println("inside if");
                // Extract captured groups (if any)
                List<String> capturedGroups = new ArrayList<>();
                for (int i = 0; i <= matcher.groupCount(); i++) {
                    capturedGroups.add(matcher.group(i));
                }

                // Extract named groups into a map
                Map<String, String> extractedFields = extractNamedGroups(matcher, patternStr);

                return new RegexMatchResponse(
                        true,
                        patternStr,
                        inputString,
                        "Pattern matched successfully!",
                        capturedGroups,
                        extractedFields
                );
            } else {
                return new RegexMatchResponse(
                        false,
                        patternStr,
                        inputString,
                        "Pattern did not match the input string"
                );
            }

        } catch (PatternSyntaxException e) {
            return new RegexMatchResponse(
                    false,
                    patternStr,
                    inputString,
                    "Invalid regex pattern: " + e.getMessage()
            );
        }
    }

    /**
     * Extract named capturing groups from the matcher
     * Dynamically finds all named groups in the pattern using regex (?<name>...)
     */
    private Map<String, String> extractNamedGroups(Matcher matcher, String patternStr) {
        Map<String, String> extractedFields = new HashMap<>();

        // Find all named groups in the pattern string using regex
        // Named groups have the syntax: (?<name>...)
        Set<String> namedGroups = findNamedGroupsInPattern(patternStr);

        System.out.println("DEBUG: Found named groups in pattern: " + namedGroups);

        // Extract each named group's value from the matcher
        for (String groupName : namedGroups) {
            try {
                String value = matcher.group(groupName);
                System.out.println("DEBUG: Extracting group '" + groupName + "' = '" + value + "'");
                if (value != null && !value.isEmpty()) {
                    extractedFields.put(groupName, value);
                }
            } catch (IllegalArgumentException e) {
                System.out.println("DEBUG: Failed to extract group '" + groupName + "': " + e.getMessage());
            }
        }

        System.out.println("HIUIII");
        System.out.println("DEBUG: Final extractedFields: " + extractedFields);


        return extractedFields;
    }

    /**
     * Find all named capturing groups in a regex pattern string
     * Looks for patterns like (?<groupName>...)
     *
     * Named groups in Java regex have the syntax: (?<name>pattern)
     * where name starts with a letter and can contain letters, digits, and underscores
     *
     * @param patternStr The regex pattern string
     * @return Set of named group names found in the pattern
     */
    private Set<String> findNamedGroupsInPattern(String patternStr) {
        Set<String> namedGroups = new HashSet<>();

        if (patternStr == null || patternStr.isEmpty()) {
            return namedGroups;
        }

        // Regex to find named groups: (?<name>
        // Named group names can contain: letters, digits, underscores
        // Must start with a letter
        // Pattern: \(\?<([a-zA-Z][a-zA-Z0-9_]*)>

        System.out.println("BKLBKLDJKLFJ");
        java.util.regex.Pattern namedGroupPattern = java.util.regex.Pattern.compile(
                "\\(\\?<([a-zA-Z][a-zA-Z0-9_]*)>"
        );
        Matcher namedGroupMatcher = namedGroupPattern.matcher(patternStr);
        System.out.println("namedGroupMatcher :  " +  namedGroupMatcher);

        while (namedGroupMatcher.find()) {
            System.out.println("Atleast once");
            String groupName = namedGroupMatcher.group(1);
            namedGroups.add(groupName);
            System.out.println("DEBUG: Found named group: " + groupName);
        }

        // If no named groups found, print the pattern for debugging
        if (namedGroups.isEmpty()) {
            System.out.println("DEBUG: No named groups found in pattern: " + patternStr);
            System.out.println("DEBUG: Pattern contains '(?<': " + patternStr.contains("(?<"));
        }

        return namedGroups;
    }

    /**
     * Overloaded method - Direct string parameters (no DTO)
     */
    public RegexMatchResponse matchRegex(String pattern, String inputString) {
        RegexMatchRequest request = new RegexMatchRequest(pattern, inputString);
        return matchRegex(request);
    }

    /**
     * Match input string against all APPROVED patterns
     * Returns the first matching pattern
     */
    @Transactional
    public PatternMatchResult matchPattern(String inputString) {
        if (inputString == null || inputString.trim().isEmpty()) {
            return new PatternMatchResult(false, null, null, inputString, "Input string is empty");
        }

        // Get all APPROVED patterns
        List<Pattern> approvedPatterns = patternRepository.findByStatus("APPROVED");

        if (approvedPatterns.isEmpty()) {
            return new PatternMatchResult(false, null, null, inputString, "No approved patterns available");
        }

        // Try to match against each pattern
        for (Pattern pattern : approvedPatterns) {
            try {
                java.util.regex.Pattern regex = java.util.regex.Pattern.compile(pattern.getRegexPattern());
                Matcher matcher = regex.matcher(inputString);

                if (matcher.find()) {
                    // Pattern matched!
                    return new PatternMatchResult(
                            true,
                            pattern.getPatternId(),
                            pattern.getRegexPattern(),
                            inputString,
                            "Pattern matched successfully"
                    );
                }
            } catch (PatternSyntaxException e) {
                // Invalid regex pattern - mark as FAILED
                pattern.setStatus("FAILED");
                patternRepository.save(pattern);
                logger.error("Invalid regex pattern (ID: {}): {}", pattern.getPatternId(), e.getMessage());
            }
        }

        // No pattern matched
        return new PatternMatchResult(false, null, null, inputString, "No pattern matched the input");
    }

    /**
     * Match input string against a SPECIFIC pattern by patternId
     */
    public PatternMatchResult matchSpecificPattern(String inputString, Integer patternId) {
        if (inputString == null || inputString.trim().isEmpty()) {
            return new PatternMatchResult(false, null, null, inputString, "Input string is empty");
        }

        Optional<Pattern> patternOpt = patternRepository.findById(patternId);

        if (patternOpt.isEmpty()) {
            return new PatternMatchResult(false, null, null, inputString, "Pattern not found");
        }

        Pattern pattern = patternOpt.get();

        try {
            java.util.regex.Pattern regex = java.util.regex.Pattern.compile(pattern.getRegexPattern());
            Matcher matcher = regex.matcher(inputString);

            if (matcher.find()) {
                return new PatternMatchResult(
                        true,
                        pattern.getPatternId(),
                        pattern.getRegexPattern(),
                        inputString,
                        "Pattern matched successfully"
                );
            } else {
                return new PatternMatchResult(
                        false,
                        pattern.getPatternId(),
                        pattern.getRegexPattern(),
                        inputString,
                        "Pattern did not match the input"
                );
            }
        } catch (PatternSyntaxException e) {
            return new PatternMatchResult(
                    false,
                    pattern.getPatternId(),
                    pattern.getRegexPattern(),
                    inputString,
                    "Invalid regex pattern: " + e.getMessage()
            );
        }
    }
}

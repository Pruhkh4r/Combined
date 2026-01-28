package com.bankingparser.dto;

import java.util.List;
import java.util.Map;

public class RegexMatchResponse {

    private boolean matched;
    private String pattern;
    private String inputString;
    private String message;
    private List<String> capturedGroups;
    private Map<String, String> extractedFields;

    public RegexMatchResponse() {
    }

    public RegexMatchResponse(boolean matched, String pattern, String inputString, String message) {
        this.matched = matched;
        this.pattern = pattern;
        this.inputString = inputString;
        this.message = message;
        this.capturedGroups = null;
        this.extractedFields = null;
    }

    public RegexMatchResponse(boolean matched, String pattern, String inputString, String message, List<String> capturedGroups) {
        this.matched = matched;
        this.pattern = pattern;
        this.inputString = inputString;
        this.message = message;
        this.capturedGroups = capturedGroups;
        this.extractedFields = null;
    }

    public RegexMatchResponse(boolean matched, String pattern, String inputString, String message, List<String> capturedGroups, Map<String, String> extractedFields) {
        this.matched = matched;
        this.pattern = pattern;
        this.inputString = inputString;
        this.message = message;
        this.capturedGroups = capturedGroups;
        this.extractedFields = extractedFields;
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
    }

    public String getPattern() {
        return pattern;
    }

    public void setPattern(String pattern) {
        this.pattern = pattern;
    }

    public String getInputString() {
        return inputString;
    }

    public void setInputString(String inputString) {
        this.inputString = inputString;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<String> getCapturedGroups() {
        return capturedGroups;
    }

    public void setCapturedGroups(List<String> capturedGroups) {
        this.capturedGroups = capturedGroups;
    }

    public Map<String, String> getExtractedFields() {
        return extractedFields;
    }

    public void setExtractedFields(Map<String, String> extractedFields) {
        this.extractedFields = extractedFields;
    }
}

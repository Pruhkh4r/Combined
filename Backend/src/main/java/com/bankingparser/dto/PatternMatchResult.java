package com.bankingparser.dto;

public class PatternMatchResult {

    private boolean matched;
    private Integer patternId;
    private String regexPattern;
    private String inputString;
    private String message;

    public PatternMatchResult() {
    }

    public PatternMatchResult(boolean matched, Integer patternId, String regexPattern, String inputString) {
        this.matched = matched;
        this.patternId = patternId;
        this.regexPattern = regexPattern;
        this.inputString = inputString;
        this.message = matched ? "Pattern matched successfully" : "No pattern matched";
    }

    public PatternMatchResult(boolean matched, Integer patternId, String regexPattern, String inputString, String message) {
        this.matched = matched;
        this.patternId = patternId;
        this.regexPattern = regexPattern;
        this.inputString = inputString;
        this.message = message;
    }

    public boolean isMatched() {
        return matched;
    }

    public void setMatched(boolean matched) {
        this.matched = matched;
    }

    public Integer getPatternId() {
        return patternId;
    }

    public void setPatternId(Integer patternId) {
        this.patternId = patternId;
    }

    public String getRegexPattern() {
        return regexPattern;
    }

    public void setRegexPattern(String regexPattern) {
        this.regexPattern = regexPattern;
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
}

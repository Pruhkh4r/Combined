package com.bankingparser.dto;

import jakarta.validation.constraints.NotBlank;

public class RegexMatchRequest {

    @NotBlank(message = "Pattern is required")
    private String pattern;

    @NotBlank(message = "Input string is required")
    private String inputString;

    public RegexMatchRequest() {
    }

    public RegexMatchRequest(String pattern, String inputString) {
        this.pattern = pattern;
        this.inputString = inputString;
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
}

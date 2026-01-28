package com.bankingparser.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pattern_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pattern {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pattern_id")
    private Integer patternId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String regexPattern;
    
    @Column(columnDefinition = "TEXT")
    private String sampleEx;
    
    @Column(nullable = false)
    private String status; // e.g., "DRAFT", "PENDING", "APPROVED", "REJECTED", "FAILED"
}

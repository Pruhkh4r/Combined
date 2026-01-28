package com.bankingparser.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "msg_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Msg {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "msg_id")
    private Integer msgId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String msg;
    
    private String bankName;
    
    private String accNo;
    
    private BigDecimal amt;
    
    private String typeOfTransaction;
    
    private String trf;
    
    private String vendor;
    
    private LocalDate date;
    
    private LocalTime time;
}

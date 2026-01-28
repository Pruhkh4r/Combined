package com.bankingparser.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AddToHistoryRequest {
    
    private Integer userId;
    
    // Message fields (excluding msgId which will be auto-generated)
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

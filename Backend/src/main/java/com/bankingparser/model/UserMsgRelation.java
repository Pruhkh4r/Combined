package com.bankingparser.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_msg_relation_table")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserMsgRelation {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    
    @Column(name = "user_id", nullable = false)
    private Integer userId;
    
    @Column(name = "msg_id", nullable = false)
    private Integer msgId;
}

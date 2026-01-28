package com.bankingparser.repository;

import com.bankingparser.model.UserMsgRelation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserMsgRelationRepository extends JpaRepository<UserMsgRelation, Integer> {
    List<UserMsgRelation> findByUserId(Integer userId);
}

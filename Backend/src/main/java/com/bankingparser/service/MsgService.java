package com.bankingparser.service;

import com.bankingparser.model.Msg;
import com.bankingparser.model.UserMsgRelation;
import com.bankingparser.repository.MsgRepository;
import com.bankingparser.repository.UserMsgRelationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MsgService {

    @Autowired
    private MsgRepository msgRepository;

    @Autowired
    private UserMsgRelationRepository userMsgRelationRepository;

    public List<Msg> getAllMessages() {
        return msgRepository.findAll();
    }

    public Optional<Msg> getMessageById(Integer id) {
        return msgRepository.findById(id);
    }

    public Msg saveMessage(Msg msg) {
        return msgRepository.save(msg);
    }

    public void deleteMessage(Integer id) {
        msgRepository.deleteById(id);
    }

//    // Add message to user's history (with existing msgId)
//    public UserMsgRelation addToHistory(Integer userId, Integer msgId) {
//        UserMsgRelation relation = new UserMsgRelation();
//        relation.setUserId(userId);
//        relation.setMsgId(msgId);
//        return userMsgRelationRepository.save(relation);
//    }

    // Save message and add to user's history
    public UserMsgRelation saveMessageAndAddToHistory(Integer userId, Msg msg) {
        // First, save the message to get the auto-generated msgId
        Msg savedMsg = msgRepository.save(msg);
        
        // Then create the relation using the generated msgId
        UserMsgRelation relation = new UserMsgRelation();
        relation.setUserId(userId);
        relation.setMsgId(savedMsg.getMsgId());
        return userMsgRelationRepository.save(relation);
    }

    // Get user's message history
    public List<Msg> getHistory(Integer userId) {
        List<UserMsgRelation> relations = userMsgRelationRepository.findByUserId(userId);
        List<Integer> msgIds = relations.stream()
                .map(UserMsgRelation::getMsgId)
                .collect(Collectors.toList());
        
        return msgRepository.findAllById(msgIds);
    }
}

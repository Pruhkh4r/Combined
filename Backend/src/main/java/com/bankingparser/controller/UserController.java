package com.bankingparser.controller;

import com.bankingparser.dto.AddToHistoryRequest;
import com.bankingparser.dto.PatternMatchResult;
import com.bankingparser.model.Msg;
import com.bankingparser.model.UserMsgRelation;
import com.bankingparser.service.MsgService;
import com.bankingparser.security.JwtUtil;
import com.bankingparser.service.PatternService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/user")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private MsgService msgService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PatternService patternService;

    /**
     * Post a message for parsing
     * Endpoint: POST /user/postMsg
     */
    @PostMapping("/postMsg")
    public ResponseEntity<Msg> postMsg(@RequestBody Msg msg) {
        // TODO: Add regex parsing logic here in future
        Msg savedMsg = msgService.saveMessage(msg);
        return ResponseEntity.ok(savedMsg);
    }

    /**
     * Add message to user's history
     * Endpoint: POST /user/addToHistory
     * Body should contain: userId and all message fields (msg, bankName, accNo, amt, etc.)
     * The message will be saved first, then linked to the user's history
     */
    @PostMapping("/addToHistory")
    public ResponseEntity<?> addToHistory(@RequestBody AddToHistoryRequest request) {
        try {
            if (request.getUserId() == null) {
                return ResponseEntity.badRequest().body("userId is required");
            }

            if (request.getMsg() == null || request.getMsg().isEmpty()) {
                return ResponseEntity.badRequest().body("msg field is required");
            }

            // Create Msg object from request
            Msg msg = new Msg();
            msg.setMsg(request.getMsg());
            msg.setBankName(request.getBankName());
            msg.setAccNo(request.getAccNo());
            msg.setAmt(request.getAmt());
            msg.setTypeOfTransaction(request.getTypeOfTransaction());
            msg.setTrf(request.getTrf());
            msg.setVendor(request.getVendor());
            msg.setDate(request.getDate());
            msg.setTime(request.getTime());

            // Save message and create relation
            UserMsgRelation relation = msgService.saveMessageAndAddToHistory(request.getUserId(), msg);
            return ResponseEntity.ok(relation);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding to history: " + e.getMessage());
        }
    }

    /**
     * Get user's message history
     * Endpoint: GET /user/getHistory/{userId}
     */
    @GetMapping("/getHistory/{userId}")
    public ResponseEntity<List<Msg>> getHistory(@PathVariable Integer userId) {
        List<Msg> history = msgService.getHistory(userId);
        return ResponseEntity.ok(history);
    }

    /**
     * Alternative: Get history from JWT token
     * Endpoint: GET /user/getHistory
     * Extracts userId from Authorization header
     */
    @GetMapping("/getHistory")
    public ResponseEntity<?> getHistoryFromToken(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // Remove "Bearer " prefix
            Integer userId = jwtUtil.extractUserId(token);
            
            List<Msg> history = msgService.getHistory(userId);
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving history: " + e.getMessage());
        }
    }


    /**
     * Match input string against all APPROVED patterns
     * Endpoint: POST /user/matchPattern
     * Body: { "inputString": "Your account XXXX1234 has been credited with Rs. 5000" }
     */
    @PostMapping("/matchPattern")
    public ResponseEntity<PatternMatchResult> matchPattern(@RequestBody Map<String, String> request) {
        String inputString = request.get("inputString");

        if (inputString == null || inputString.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    new PatternMatchResult(false, null, null, "", "Input string is required")
            );
        }

        PatternMatchResult result = patternService.matchPattern(inputString);
        return ResponseEntity.ok(result);
    }
}

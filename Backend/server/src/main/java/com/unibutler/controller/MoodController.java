package com.unibutler.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.unibutler.dto.MoodCreateRequest;
import com.unibutler.model.MoodLog;
import com.unibutler.model.User;
import com.unibutler.service.AuthService;
import com.unibutler.service.MoodService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/moods")
@CrossOrigin(origins = "*")
public class MoodController {
  private final AuthService auth;
  private final MoodService moods;

  public MoodController(AuthService auth, MoodService moods) {
    this.auth = auth; this.moods = moods;
  }

  @PostMapping
  public ResponseEntity<?> create(@RequestHeader("X-Auth-Token") String token,
                                  @Valid @RequestBody MoodCreateRequest req) {
    try {
      User u = auth.requireUser(token);
      MoodLog m = new MoodLog();
      m.setMood(req.getMood());
      m.setStress(req.getStress());
      m.setNote(req.getNote());
      m.setDate(req.getDate());
      return ResponseEntity.ok(moods.create(u.getId(), m));
    } catch (Exception e) {
      return ResponseEntity.status(401).body(e.getMessage());
    }
  }

  @GetMapping("/latest")
  public ResponseEntity<?> latest(@RequestHeader("X-Auth-Token") String token) {
    try {
      User u = auth.requireUser(token);
      List<MoodLog> list = moods.latest(u.getId());
      return ResponseEntity.ok(list);
    } catch (Exception e) {
      return ResponseEntity.status(401).body(e.getMessage());
    }
  }

  @GetMapping("/range")
  public ResponseEntity<?> range(@RequestHeader("X-Auth-Token") String token,
                                 @RequestParam String start,
                                 @RequestParam String end) {
    try {
      User u = auth.requireUser(token);
      List<MoodLog> list = moods.range(u.getId(), LocalDate.parse(start), LocalDate.parse(end));
      return ResponseEntity.ok(list);
    } catch (Exception e) {
      return ResponseEntity.status(401).body(e.getMessage());
    }
  }
}

package com.unibutler.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.unibutler.model.MoodLog;
import com.unibutler.repo.MoodRepo;

@Service
public class MoodService {
  private final MoodRepo repo;
  public MoodService(MoodRepo repo) { 
    this.repo = repo; 
  }

  public MoodLog create(String userId, MoodLog m) {
    m.setId(null);
    m.setUserId(userId);
    if (m.getDate() == null) m.setDate(LocalDate.now());
    return repo.save(m);
  }

  public List<MoodLog> range(String userId, LocalDate start, LocalDate end) {
    return repo.findByUserIdAndDateBetween(userId, start, end);
    }

  public List<MoodLog> latest(String userId) {
    return repo.findByUserIdOrderByDateDesc(userId);
  }
}

package com.unibutler.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unibutler.model.User;
import com.unibutler.service.AuthService;
import com.unibutler.service.MoodService;
import com.unibutler.service.TaskService;

@RestController
@RequestMapping("/api/suggestions")
@CrossOrigin(origins = "*")
public class SuggestionsController {
  private final AuthService auth;
  private final TaskService taskService;
  private final MoodService moodService;

  public SuggestionsController(AuthService auth, TaskService taskService, 
                             MoodService moodService) {
    this.auth = auth;
    this.taskService = taskService;
    this.moodService = moodService;
  }

  @GetMapping
  public ResponseEntity<?> suggestions(@RequestHeader("X-Auth-Token") String token) {
    try {
      User u = auth.requireUser(token);
      
      // Lấy dữ liệu thật để tạo suggestions
      LocalDate end = LocalDate.now();
      LocalDate start = end.minusDays(7);
      
      var tasks = taskService.list(u.getId());
      var moods = moodService.range(u.getId(), start, end);
      
      List<Map<String, String>> suggestions = generatePersonalizedSuggestions(u, tasks, moods);
      
      return ResponseEntity.ok(Map.of("items", suggestions));
    } catch (Exception e) {
      return ResponseEntity.status(401).body(e.getMessage());
    }
  }

  private List<Map<String, String>> generatePersonalizedSuggestions(User user, List<?> tasks, @SuppressWarnings("unused") List<?> moods) {
    List<Map<String, String>> suggestions = new ArrayList<>();
    
    // Tính toán dữ liệu để đưa ra suggestions phù hợp
    long totalTasks = tasks.size();
    long completedTasks = tasks.stream()
        .filter(t -> {
          try {
            return "DONE".equals(t.getClass().getMethod("getStatus").invoke(t));
          } catch (ReflectiveOperationException e) {
            return false;
          }
        })
        .count();
    
    double completionRate = totalTasks > 0 ? (double) completedTasks / totalTasks : 0;
    
    // Suggestion dựa trên completion rate
    if (completionRate < 0.3) {
      suggestions.add(Map.of(
        "type", "📚 Study Strategy",
        "title", "Break down large tasks into smaller chunks",
        "when", "Today",
        "where", "AI Recommendation"
      ));
    } else if (completionRate > 0.8) {
      suggestions.add(Map.of(
        "type", "🎯 Goal Setting",
        "title", "Set more challenging academic goals",
        "when", "This week",
        "where", "AI Recommendation"
      ));
    }
    
    // Suggestion dựa trên productivity preference
    String preference = user.getProductivityPreference();
    if ("morning".equals(preference)) {
      suggestions.add(Map.of(
        "type", "🌅 Morning Routine",
        "title", "Join the Early Bird Study Group",
        "when", "Daily 7:00 AM",
        "where", "Library Study Room 1"
      ));
    } else if ("evening".equals(preference)) {
      suggestions.add(Map.of(
        "type", "🌙 Evening Study",
        "title", "Night Owl Study Session",
        "when", "Daily 8:00 PM",
        "where", "24/7 Study Hall"
      ));
    }
    
    // Suggestion chung
    suggestions.add(Map.of(
      "type", "💡 Study Tip",
      "title", "Use the Pomodoro Technique for better focus",
      "when", "Anytime",
      "where", "AI Recommendation"
    ));
    
    suggestions.add(Map.of(
      "type", "🧠 Wellness",
      "title", "Mindfulness and Stress Management Workshop",
      "when", "Wednesday 2:00 PM",
      "where", "Student Wellness Center"
    ));
    
    suggestions.add(Map.of(
      "type", "📊 Analytics",
      "title", "Review your weekly progress dashboard",
      "when", "Weekly",
      "where", "UniButler Dashboard"
    ));
    
    return suggestions;
  }
}

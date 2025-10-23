package com.unibutler.controller;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.unibutler.model.MoodLog;
import com.unibutler.model.Task;
import com.unibutler.model.User;
import com.unibutler.repo.TaskRepo;
import com.unibutler.service.AuthService;
import com.unibutler.service.InsightsService;
import com.unibutler.service.MoodService;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

  private final AuthService auth;
  private final TaskRepo taskRepo;
  private final MoodService moods;
  private final InsightsService insights;

  public DashboardController(AuthService auth, TaskRepo taskRepo, MoodService moods, InsightsService insights) {
    this.auth = auth;
    this.taskRepo = taskRepo;
    this.moods = moods;
    this.insights = insights;
  }

  /** Tổng hợp tuần dựa trên dữ liệu thật */
  @GetMapping("/weekly-summary")
  public ResponseEntity<?> weekly(@RequestHeader("X-Auth-Token") String token) {
    try {
      User u = auth.requireUser(token);
      LocalDate end = LocalDate.now();
      LocalDate start = end.minusDays(6);

      // Lấy tasks: nếu chưa có query theo khoảng ngày, lấy tất cả rồi lọc
      List<Task> allTasks = taskRepo.findByUserIdOrderByDueDateAsc(u.getId());
      List<Task> weekTasks = new ArrayList<>();
      for (Task t : allTasks) {
        LocalDate d = null;
        // Hỗ trợ cả Instant/LocalDate
        try {
          Object val = t.getClass().getMethod("getDueDate").invoke(t);
          if (val instanceof java.time.LocalDate) d = (java.time.LocalDate) val;
          else if (val instanceof java.time.Instant)
            d = ((java.time.Instant) val).atZone(java.time.ZoneId.systemDefault()).toLocalDate();
        } catch (Exception ignored) {}
        if (d != null && !d.isBefore(start) && !d.isAfter(end)) weekTasks.add(t);
      }

      List<MoodLog> weekMoods = moods.range(u.getId(), start, end);

      Map<String, Object> res = new HashMap<>(insights.weeklySummary(weekTasks, weekMoods));
      res.put("bestStudyWindow", insights.bestStudyWindow(u.getProductivityPreference() != null ? u.getProductivityPreference() : "morning"));

      // stress peak day (thật)
      String peak = weekMoods.stream()
          .max(Comparator.comparingInt(MoodLog::getStress))
          .map(m -> m.getDate().getDayOfWeek().toString())
          .orElse("Unknown");
      res.put("stressPeakDay", peak);

      // ví dụ tham số bổ sung
      res.put("earlyCompletionBoost", 15);
      return ResponseEntity.ok(res);
    } catch (Exception e) {
      return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
    }
  }

  /** Chuỗi dữ liệu biểu đồ thật */
  @GetMapping("/growth")
  public ResponseEntity<?> growth(@RequestHeader("X-Auth-Token") String token) {
    try {
      User u = auth.requireUser(token);
      LocalDate end = LocalDate.now();
      LocalDate start = end.minusDays(6);

      List<Task> allTasks = taskRepo.findByUserIdOrderByDueDateAsc(u.getId());
      List<MoodLog> weekMoods = moods.range(u.getId(), start, end);

      List<Map<String, Object>> series = insights.growthSeries(start, end, allTasks, weekMoods);
      return ResponseEntity.ok(series);
    } catch (Exception e) {
      return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
    }
  }
}

package com.unibutler.service;

import java.lang.reflect.InvocationTargetException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.unibutler.model.MoodLog;
import com.unibutler.model.Task;

@Service
public class InsightsService {

  /** Weekly KPIs tổng hợp từ dữ liệu thật */
  public Map<String, Object> weeklySummary(List<Task> tasks, List<MoodLog> moods) {
    Map<String, Object> out = new HashMap<>();

    long total = tasks.size();
    long done = tasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
    double productivity = total == 0 ? 0 : (done * 100.0 / total);

    double avgStress = moods.stream().mapToInt(MoodLog::getStress).average().orElse(0);
    double avgMood   = moods.stream().mapToInt(MoodLog::getMood).average().orElse(0);

    out.put("tasksDone", done);
    out.put("tasksTotal", total);
    out.put("productivityScore", productivity);
    out.put("avgStress", avgStress);
    out.put("avgMood", avgMood);
    out.put("tip", getPersonalTip(avgStress, avgMood, productivity));
    return out;
  }

  /** Chuỗi dữ liệu cho biểu đồ Personal Growth (theo từng ngày trong khoảng) */
  public List<Map<String, Object>> growthSeries(LocalDate start, LocalDate end,
                                                List<Task> tasks, List<MoodLog> moods) {
    // Index mood/stress theo ngày
    Map<LocalDate, MoodLog> moodByDate = moods.stream()
        .collect(Collectors.toMap(MoodLog::getDate, m -> m, (a, b) -> b));

    // Index tasks theo ngày (dựa vào dueDate; nếu Task.dueDate là Instant thì convert về LocalDate)
    Map<LocalDate, List<Task>> tasksByDate = new HashMap<>();
    for (Task t : tasks) {
      LocalDate d = extractDueDateLocal(t);
      if (d != null && !d.isBefore(start) && !d.isAfter(end)) {
        tasksByDate.computeIfAbsent(d, k -> new ArrayList<>()).add(t);
      }
    }

    List<Map<String, Object>> out = new ArrayList<>();
    for (LocalDate d = start; !d.isAfter(end); d = d.plusDays(1)) {
      MoodLog m = moodByDate.get(d);
      List<Task> dayTasks = tasksByDate.getOrDefault(d, Collections.emptyList());
      long done = dayTasks.stream().filter(t -> "DONE".equalsIgnoreCase(t.getStatus())).count();
      long total = dayTasks.size();
      double productivity = total == 0 ? 0 : (done * 100.0 / total);

      out.add(Map.of(
          "day", d.getDayOfWeek().toString().substring(0, 3), // Mon/Tue/...
          "mood",    m == null ? 0 : m.getMood(),
          "stress",  m == null ? 0 : m.getStress(),
          "productivity", productivity
      ));
    }
    return out;
  }

  /** Best study window theo sở thích */
  public String bestStudyWindow(String preference) {
    switch (preference == null ? "" : preference.toLowerCase()) {
      case "morning":   return "08:00–11:00";
      case "afternoon": return "13:00–16:00";
      case "evening":   return "19:00–22:00";
      default:          return "09:00–12:00";
    }
  }

  /** Tip cá nhân hoá dựa vào stress/mood/productivity */
  public String getPersonalTip(double avgStress, double avgMood, double productivity) {
    if (avgStress >= 7)              return "Stress cao. Hãy dùng phiên Pomodoro ngắn và thêm thời gian nghỉ.";
    if (productivity < 50)           return "Bắt đầu bằng một tác vụ nhỏ để tạo đà nhé.";
    if (avgMood < 3)                 return "Thử học vào buổi sáng sớm và tránh bị xao nhãng.";
    return "Bạn đang làm rất tốt! Giữ nhịp độ này nhé.";
  }

  /** Nếu Task.dueDate là Instant -> convert; nếu đã là LocalDate thì trả về trực tiếp */
  private LocalDate extractDueDateLocal(Task t) {
    try {
      // Thử getter LocalDate trước
      java.lang.reflect.Method m = t.getClass().getMethod("getDueDate");
      Object val = m.invoke(t);
      if (val == null) return null;
      if (val instanceof LocalDate) return (LocalDate) val;
      if (val instanceof java.time.Instant)
        return ((java.time.Instant) val).atZone(ZoneId.systemDefault()).toLocalDate();
      // Nếu kiểu khác, bỏ qua
      return null;
    } catch (IllegalAccessException | NoSuchMethodException | SecurityException | InvocationTargetException ignore) {
      return null;
    }
  }
}

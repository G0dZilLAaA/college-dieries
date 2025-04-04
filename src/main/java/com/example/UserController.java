package com.example;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserDAO userDAO = new UserDAO();
    private final StoryDAO storyDAO = new StoryDAO();

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        try {
            userDAO.addUser(user);
            return ResponseEntity.ok("User registered successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestParam int userId, @RequestParam String userType) {
        User user = userDAO.getUser(userId, userType);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.badRequest().body(null);
    }

    @PostMapping("/stories")
    public ResponseEntity<String> addStory(@RequestBody Story story) {
        try {
            storyDAO.addStory(story);
            return ResponseEntity.ok("Story added successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to add story: " + e.getMessage());
        }
    }

    // New endpoint to fetch all stories with usernames
    @GetMapping("/stories")
    public ResponseEntity<List<StoryWithUser>> getAllStories() {
        try {
            List<StoryWithUser> stories = storyDAO.getAllStoriesWithUser();
            return ResponseEntity.ok(stories);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/stories/like")
    public ResponseEntity<String> likeStory(@RequestBody StoryAction action) {
        try {
            storyDAO.updateLikeCount(action.getUserId(), action.getUserType(), action.getTimestamp(), true);
            return ResponseEntity.ok("Liked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to like story: " + e.getMessage());
        }
    }

    @PostMapping("/stories/dislike")
    public ResponseEntity<String> dislikeStory(@RequestBody StoryAction action) {
        try {
            storyDAO.updateDislikeCount(action.getUserId(), action.getUserType(), action.getTimestamp(), true);
            return ResponseEntity.ok("Disliked successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to dislike story: " + e.getMessage());
        }
    }
}

// Class to handle like/dislike requests
class StoryAction {
    private int userId;
    private String userType;
    private String timestamp;

    // Getters and setters
    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }
    public String getUserType() { return userType; }
    public void setUserType(String userType) { this.userType = userType; }
    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }
}
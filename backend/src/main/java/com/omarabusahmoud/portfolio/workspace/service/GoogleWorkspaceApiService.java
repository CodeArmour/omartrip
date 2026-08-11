package com.omarabusahmoud.portfolio.workspace.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

import com.omarabusahmoud.portfolio.booking.entity.BookingRequestEntity;
import com.omarabusahmoud.portfolio.workspace.config.WorkspaceGoogleProperties;
import com.omarabusahmoud.portfolio.workspace.exception.WorkspaceIntegrationException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;

@Service
public class GoogleWorkspaceApiService {
    private static final String TIMEZONE = "Europe/Brussels";
    private final WorkspaceGoogleProperties properties;
    private final WorkspaceGoogleConnectionService connection;
    private final RestClient client = RestClient.create();

    public GoogleWorkspaceApiService(WorkspaceGoogleProperties properties, WorkspaceGoogleConnectionService connection) {
        this.properties = properties; this.connection = connection;
    }

    public WorkspaceBookingResult confirmBooking(BookingRequestEntity booking) {
        if (!properties.configured() || !connection.connected()) {
            throw new WorkspaceIntegrationException("Connect the Google Workspace calendar before confirming bookings.");
        }
        String accessToken = accessToken();
        Map<String, Object> event = new HashMap<>();
        event.put("summary", "Portfolio call with " + booking.getFullName());
        event.put("description", "Topic: " + booking.getTopic() + "\n\nRequested through Omar Abusahmoud's portfolio.");
        event.put("start", Map.of("dateTime", booking.getStartsAt().toString(), "timeZone", TIMEZONE));
        event.put("end", Map.of("dateTime", booking.getEndsAt().toString(), "timeZone", TIMEZONE));
        event.put("attendees", List.of(Map.of("email", booking.getEmail(), "displayName", booking.getFullName())));
        event.put("conferenceData", Map.of("createRequest", Map.of(
                "requestId", UUID.randomUUID().toString(),
                "conferenceSolutionKey", Map.of("type", "hangoutsMeet"))));
        Map<String, Object> created = postCalendar(accessToken, event);
        String eventId = text(created, "id");
        String meetUrl = conferenceUrl(created);
        if (meetUrl == null && eventId != null) {
            for (int attempt = 0; attempt < 6 && meetUrl == null; attempt++) {
                pause(500);
                meetUrl = conferenceUrl(getCalendarEvent(accessToken, eventId));
            }
        }
        if (eventId == null || meetUrl == null) throw new WorkspaceIntegrationException("Google Meet was not ready yet. Please try confirming again.");
        sendConfirmationEmail(accessToken, booking, meetUrl);
        return new WorkspaceBookingResult(eventId, meetUrl);
    }

    private Map<String, Object> postCalendar(String accessToken, Map<String, Object> event) {
        try {
            return client.post().uri(uri -> uri.scheme("https").host("www.googleapis.com")
                    .path("/calendar/v3/calendars/{calendarId}/events").queryParam("conferenceDataVersion", 1)
                    .queryParam("sendUpdates", "all").build(properties.email()))
                    .headers(headers -> headers.setBearerAuth(accessToken)).contentType(MediaType.APPLICATION_JSON)
                    .body(event).retrieve().body(new ParameterizedTypeReference<>() {});
        } catch (Exception exception) { throw new WorkspaceIntegrationException("Google Calendar could not create the event.", exception); }
    }

    private Map<String, Object> getCalendarEvent(String accessToken, String eventId) {
        try {
            return client.get().uri(uri -> uri.scheme("https").host("www.googleapis.com")
                    .path("/calendar/v3/calendars/{calendarId}/events/{eventId}").build(properties.email(), eventId))
                    .headers(headers -> headers.setBearerAuth(accessToken)).retrieve().body(new ParameterizedTypeReference<>() {});
        } catch (Exception exception) { return Map.of(); }
    }

    private String accessToken() {
        String refreshToken = connection.refreshToken();
        if (refreshToken == null) throw new WorkspaceIntegrationException("Connect the Google Workspace calendar before confirming bookings.");
        try {
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", properties.clientId()); body.add("client_secret", properties.clientSecret());
            body.add("refresh_token", refreshToken); body.add("grant_type", "refresh_token");
            Map<String, Object> response = client.post().uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED).body(body).retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            String token = response == null ? null : text(response, "access_token");
            if (token == null) throw new WorkspaceIntegrationException("Google Workspace authorization expired. Reconnect it.");
            return token;
        } catch (WorkspaceIntegrationException exception) { throw exception; }
        catch (Exception exception) { throw new WorkspaceIntegrationException("Google Workspace authorization could not be refreshed.", exception); }
    }

    private void sendConfirmationEmail(String accessToken, BookingRequestEntity booking, String meetUrl) {
        String subject = "Booking confirmed with Omar Abusahmoud";
        String name = escapeHtml(booking.getFullName());
        String safeMeetUrl = escapeHtml(meetUrl);
        String safeTopic = escapeHtml(booking.getTopic());
        String time = booking.getStartsAt().atZone(ZoneId.of(TIMEZONE))
                .format(DateTimeFormatter.ofPattern("EEEE, d MMMM yyyy · HH:mm z", Locale.ENGLISH));
        String plainText = "Hello " + booking.getFullName() + ",\r\n\r\nYour 30-minute call with Omar Abusahmoud is confirmed.\r\n\r\n"
                + "When: " + time + "\r\nGoogle Meet: " + meetUrl + "\r\n\r\nSee you soon!";
        String html = """
                <!doctype html><html><body style="margin:0;background:#eef1e7;color:#253017;font-family:Arial,sans-serif;">
                <div style="padding:32px 16px;"><div style="max-width:560px;margin:0 auto;background:#2f3a1d;border-radius:20px;overflow:hidden;">
                <div style="height:7px;background:#cfff74;"></div><div style="padding:34px 34px 30px;">
                <p style="margin:0 0 22px;color:#cfff74;font-size:12px;letter-spacing:2px;font-weight:bold;">OMAR ABUSAHMOUD · BOOKING</p>
                <h1 style="margin:0 0 14px;color:#f8faef;font-size:30px;line-height:1.15;">Your call is confirmed</h1>
                <p style="margin:0 0 26px;color:#dce4cf;font-size:16px;line-height:1.6;">Hi %s, I’m looking forward to speaking with you.</p>
                <div style="background:#3d4a28;border:1px solid rgba(207,255,116,.32);border-radius:14px;padding:18px 20px;margin-bottom:24px;">
                <p style="margin:0 0 8px;color:#cfff74;font-size:12px;letter-spacing:1px;font-weight:bold;">30-MINUTE SESSION</p>
                <p style="margin:0;color:#f8faef;font-size:16px;line-height:1.6;">%s</p>
                <p style="margin:10px 0 0;color:#cbd6bd;font-size:13px;">Europe/Brussels · Online meeting</p>
                </div>
                <a href="%s" style="display:inline-block;background:#cfff74;color:#2f3a1d;text-decoration:none;font-weight:bold;padding:13px 20px;border-radius:999px;">Join Google Meet&nbsp; →</a>
                <p style="margin:28px 0 0;color:#aebaa1;font-size:12px;line-height:1.6;">Please keep this email for your meeting details. If you need to reschedule, reply to this message.</p>
                </div><div style="padding:16px 34px;background:#263116;color:#9eaa91;font-size:12px;">%s</div>
                </div></div></body></html>
                """.formatted(name, time, safeMeetUrl, safeTopic.isBlank() ? "Thanks for reaching out." : "Topic: " + safeTopic);
        String boundary = "=_OmarPortfolio_" + UUID.randomUUID();
        String raw = "From: " + properties.email() + "\r\nTo: " + booking.getEmail() + "\r\nSubject: " + subject
                + "\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary=\"" + boundary + "\"\r\n\r\n"
                + "--" + boundary + "\r\nContent-Type: text/plain; charset=UTF-8\r\n\r\n" + plainText + "\r\n\r\n"
                + "--" + boundary + "\r\nContent-Type: text/html; charset=UTF-8\r\n\r\n" + html + "\r\n\r\n--" + boundary + "--";
        try {
            client.post().uri("https://gmail.googleapis.com/gmail/v1/users/{userId}/messages/send", properties.email())
                    .headers(headers -> headers.setBearerAuth(accessToken)).contentType(MediaType.APPLICATION_JSON)
                    .body(Map.of("raw", Base64.getUrlEncoder().withoutPadding().encodeToString(raw.getBytes(StandardCharsets.UTF_8))))
                    .retrieve().toBodilessEntity();
        } catch (Exception exception) { throw new WorkspaceIntegrationException("The booking was created, but the confirmation email could not be sent.", exception); }
    }

    private String escapeHtml(String value) {
        return value == null ? "" : value.replace("&", "&amp;").replace("<", "&lt;")
                .replace(">", "&gt;").replace("\"", "&quot;").replace("'", "&#39;");
    }

    @SuppressWarnings("unchecked")
    private String conferenceUrl(Map<String, Object> event) {
        Object conferenceData = event.get("conferenceData");
        if (!(conferenceData instanceof Map<?, ?> data) || !(data.get("entryPoints") instanceof List<?> entries)) return null;
        for (Object item : entries) if (item instanceof Map<?, ?> entry && "video".equals(entry.get("entryPointType"))) return String.valueOf(entry.get("uri"));
        return null;
    }

    private String text(Map<String, Object> map, String key) { Object value = map.get(key); return value == null ? null : String.valueOf(value); }
    private void pause(long millis) { try { Thread.sleep(Duration.ofMillis(millis)); } catch (InterruptedException exception) { Thread.currentThread().interrupt(); } }
    public record WorkspaceBookingResult(String calendarEventId, String googleMeetUrl) {}
}

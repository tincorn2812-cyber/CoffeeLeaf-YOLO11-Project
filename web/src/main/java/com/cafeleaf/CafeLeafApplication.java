package com.cafeleaf;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.ServerSocket;

@SpringBootApplication
public class CafeLeafApplication {

    public static void main(String[] args) {
        freePortIfOccupied(8080);
        SpringApplication.run(CafeLeafApplication.class, args);
    }

    private static void freePortIfOccupied(int port) {
        try (ServerSocket ignored = new ServerSocket(port)) {
            return; // Port is free
        } catch (Exception occupied) {
            long currentPid = ProcessHandle.current().pid();
            try {
                Process p = new ProcessBuilder("cmd.exe", "/c", "netstat -ano | findstr :" + port).start();
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(p.getInputStream()))) {
                    String line;
                    while ((line = reader.readLine()) != null) {
                        String trimmed = line.trim();
                        if (trimmed.contains("LISTENING")) {
                            String[] parts = trimmed.split("\\s+");
                            long pid = Long.parseLong(parts[parts.length - 1]);
                            if (pid > 0 && pid != currentPid) {
                                ProcessHandle.of(pid).ifPresent(ProcessHandle::destroyForcibly);
                            }
                        }
                    }
                }
                Thread.sleep(800);
            } catch (Exception ex) {
                // ignore error when freeing port
            }
        }
    }
}
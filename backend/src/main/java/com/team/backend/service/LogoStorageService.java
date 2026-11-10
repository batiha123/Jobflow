package com.team.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.Iterator;
import java.util.UUID;

@Service
public class LogoStorageService {

    private static final long MAX_LOGO_SIZE = 5L * 1024 * 1024;
    private static final int MAX_IMAGE_DIMENSION = 4096;
    private static final long MAX_IMAGE_PIXELS = 16_000_000L;
    private static final String PUBLIC_LOGO_PATH = "/uploads/logos/";
    private static final byte[] PNG_SIGNATURE = {
            (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
    };

    private final Path logoDirectory;

    public LogoStorageService(@Value("${app.upload.logo-dir:./uploads/logos}") String logoDirectory) {
        this.logoDirectory = Path.of(logoDirectory).toAbsolutePath().normalize();
    }

    public String storeLogo(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Logo file must not be empty");
        }
        if (file.getSize() > MAX_LOGO_SIZE) {
            throw new IllegalArgumentException("Logo file must not exceed 5 MB");
        }

        byte[] content;
        try {
            content = file.getBytes();
        } catch (IOException exception) {
            throw new UncheckedIOException("Unable to read logo file", exception);
        }
        if (content.length > MAX_LOGO_SIZE) {
            throw new IllegalArgumentException("Logo file must not exceed 5 MB");
        }

        String extension = detectImageExtension(content);
        validateImage(content);

        try {
            Files.createDirectories(logoDirectory);
            String filename = UUID.randomUUID() + extension;
            Path destination = logoDirectory.resolve(filename).normalize();
            if (!destination.startsWith(logoDirectory)) {
                throw new IllegalStateException("Generated logo path is outside the logo directory");
            }
            Files.write(destination, content, StandardOpenOption.CREATE_NEW, StandardOpenOption.WRITE);
            return PUBLIC_LOGO_PATH + filename;
        } catch (IOException exception) {
            throw new UncheckedIOException("Unable to store logo file", exception);
        }
    }

    public void deleteLogo(String logoPath) {
        if (logoPath == null || !logoPath.startsWith(PUBLIC_LOGO_PATH)) {
            throw new IllegalArgumentException("Invalid logo path");
        }

        String filename = logoPath.substring(PUBLIC_LOGO_PATH.length());
        if (!filename.matches("[0-9a-fA-F-]{36}\\.(png|jpg)")) {
            throw new IllegalArgumentException("Invalid logo path");
        }

        Path target = logoDirectory.resolve(filename).normalize();
        if (!target.startsWith(logoDirectory) || !logoDirectory.equals(target.getParent())) {
            throw new IllegalArgumentException("Invalid logo path");
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            throw new UncheckedIOException("Unable to delete logo file", exception);
        }
    }

    private String detectImageExtension(byte[] content) {
        if (hasPngSignature(content)) {
            return ".png";
        }
        if (hasJpegSignature(content)) {
            return ".jpg";
        }
        throw new IllegalArgumentException("Only PNG and JPEG logo files are allowed");
    }

    private boolean hasPngSignature(byte[] content) {
        if (content.length < PNG_SIGNATURE.length) {
            return false;
        }
        for (int index = 0; index < PNG_SIGNATURE.length; index++) {
            if (content[index] != PNG_SIGNATURE[index]) {
                return false;
            }
        }
        return true;
    }

    private boolean hasJpegSignature(byte[] content) {
        return content.length >= 3
                && (content[0] & 0xFF) == 0xFF
                && (content[1] & 0xFF) == 0xD8
                && (content[2] & 0xFF) == 0xFF;
    }

    private void validateImage(byte[] content) {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(content))) {
            if (input == null) {
                throw new IllegalArgumentException("Logo file is not a valid image");
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException("Logo file is not a valid image");
            }

            ImageReader reader = readers.next();
            try {
                reader.setInput(input, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (width <= 0 || height <= 0
                        || width > MAX_IMAGE_DIMENSION
                        || height > MAX_IMAGE_DIMENSION
                        || (long) width * height > MAX_IMAGE_PIXELS) {
                    throw new IllegalArgumentException("Logo image dimensions exceed the allowed limits");
                }

                reader.read(0);
            } finally {
                reader.dispose();
            }
        } catch (IOException exception) {
            throw new IllegalArgumentException("Logo file is not a valid image", exception);
        }
    }
}

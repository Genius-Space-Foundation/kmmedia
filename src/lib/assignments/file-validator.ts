/**
 * File Validation and Security Scanning Module
 * Handles comprehensive file validation for assignment uploads
 */

export interface FileValidationConfig {
  allowedFormats: string[];
  maxFileSize: number;
  maxFiles?: number;
  requireContentTypeMatch?: boolean;
  enableVirusScanning?: boolean;
  enableMalwareDetection?: boolean;
}

export interface FileValidationResult {
  isValid: boolean;
  errors: FileValidationError[];
  warnings: string[];
  fileInfo: FileInfo;
}

export interface FileValidationError {
  code: ValidationErrorCode;
  message: string;
  field?: string;
}

export interface FileInfo {
  name: string;
  size: number;
  type: string;
  extension: string;
  detectedMimeType: string;
  isExecutable: boolean;
  hasMultipleExtensions: boolean;
}

export interface SecurityScanResult {
  isClean: boolean;
  threats: ThreatInfo[];
  scanDate: Date;
  scanDuration: number;
  scanEngine: string;
}

export interface ThreatInfo {
  type: ThreatType;
  name: string;
  severity: ThreatSeverity;
  description: string;
}

export enum ValidationErrorCode {
  INVALID_FORMAT = "INVALID_FORMAT",
  FILE_TOO_LARGE = "FILE_TOO_LARGE",
  FILE_TOO_SMALL = "FILE_TOO_SMALL",
  INVALID_NAME = "INVALID_NAME",
  CONTENT_TYPE_MISMATCH = "CONTENT_TYPE_MISMATCH",
  POTENTIALLY_MALICIOUS = "POTENTIALLY_MALICIOUS",
  VIRUS_DETECTED = "VIRUS_DETECTED",
  CORRUPTED_FILE = "CORRUPTED_FILE",
  EXECUTABLE_FILE = "EXECUTABLE_FILE",
  MULTIPLE_EXTENSIONS = "MULTIPLE_EXTENSIONS",
}

export enum ThreatType {
  VIRUS = "VIRUS",
  MALWARE = "MALWARE",
  TROJAN = "TROJAN",
  SUSPICIOUS_CONTENT = "SUSPICIOUS_CONTENT",
  PHISHING = "PHISHING",
}

export enum ThreatSeverity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

// File format configurations
export const ASSIGNMENT_FILE_CONFIGS = {
  DOCUMENTS: {
    formats: ["pdf", "doc", "docx"],
    maxSize: 50 * 1024 * 1024, // 50MB
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  VIDEOS: {
    formats: ["mp4", "mov", "avi"],
    maxSize: 500 * 1024 * 1024, // 500MB
    mimeTypes: ["video/mp4", "video/quicktime", "video/x-msvideo", "video/avi"],
  },
  IMAGES: {
    formats: ["jpg", "jpeg", "png", "gif"],
    maxSize: 10 * 1024 * 1024, // 10MB
    mimeTypes: ["image/jpeg", "image/png", "image/gif"],
  },
};

export class FileValidator {
  private config: FileValidationConfig;

  constructor(config: FileValidationConfig) {
    this.config = {
      requireContentTypeMatch: true,
      enableVirusScanning: true,
      enableMalwareDetection: true,
      ...config,
    };
  }

  /**
   * Validate a file against the configured rules
   */
  async validateFile(
    file: File | Buffer,
    fileName: string
  ): Promise<FileValidationResult> {
    const startTime = Date.now();
    const errors: FileValidationError[] = [];
    const warnings: string[] = [];

    // Get file info
    const fileInfo = await this.getFileInfo(file, fileName);

    // Basic validation checks
    this.validateFileName(fileInfo, errors);
    this.validateFileSize(fileInfo, errors);
    this.validateFileFormat(fileInfo, errors);
    this.validateContentType(fileInfo, errors, warnings);
    this.validateSecurity(fileInfo, errors, warnings);

    // Advanced security checks if enabled
    if (this.config.enableVirusScanning || this.config.enableMalwareDetection) {
      const securityResult = await this.performSecurityScan(file, fileInfo);
      if (!securityResult.isClean) {
        errors.push({
          code: ValidationErrorCode.VIRUS_DETECTED,
          message: `Security threats detected: ${securityResult.threats
            .map((t) => t.name)
            .join(", ")}`,
        });
      }
    }

    const validationTime = Date.now() - startTime;
    console.log(
      `File validation completed in ${validationTime}ms for ${fileName}`
    );

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      fileInfo,
    };
  }

  /**
   * Validate multiple files
   */
  async validateFiles(
    files: (File | Buffer)[],
    fileNames: string[]
  ): Promise<FileValidationResult[]> {
    if (files.length !== fileNames.length) {
      throw new Error("Files and fileNames arrays must have the same length");
    }

    // Check max files limit
    if (this.config.maxFiles && files.length > this.config.maxFiles) {
      throw new Error(
        `Too many files. Maximum allowed: ${this.config.maxFiles}`
      );
    }

    const results = await Promise.all(
      files.map((file, index) => this.validateFile(file, fileNames[index]))
    );

    return results;
  }

  /**
   * Get comprehensive file information
   */
  private async getFileInfo(
    file: File | Buffer,
    fileName: string
  ): Promise<FileInfo> {
    const fileBuffer =
      file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;
    const fileSize = file instanceof File ? file.size : file.length;
    const fileType = file instanceof File ? file.type : "";

    const extension = this.extractFileExtension(fileName);
    const detectedMimeType = await this.detectMimeType(fileBuffer);
    const isExecutable = this.isExecutableFile(fileName);
    const hasMultipleExtensions = this.hasMultipleExtensions(fileName);

    return {
      name: fileName,
      size: fileSize,
      type: fileType,
      extension,
      detectedMimeType,
      isExecutable,
      hasMultipleExtensions,
    };
  }

  /**
   * Validate file name
   */
  private validateFileName(
    fileInfo: FileInfo,
    errors: FileValidationError[]
  ): void {
    const { name } = fileInfo;

    // Check for empty name
    if (!name || name.trim().length === 0) {
      errors.push({
        code: ValidationErrorCode.INVALID_NAME,
        message: "File name cannot be empty",
        field: "fileName",
      });
      return;
    }

    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*\x00-\x1f]/;
    if (dangerousChars.test(name)) {
      errors.push({
        code: ValidationErrorCode.INVALID_NAME,
        message: "File name contains invalid characters",
        field: "fileName",
      });
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i;
    if (reservedNames.test(name)) {
      errors.push({
        code: ValidationErrorCode.INVALID_NAME,
        message: "File name is reserved and cannot be used",
        field: "fileName",
      });
    }

    // Check for path traversal attempts
    if (name.includes("..") || name.includes("/") || name.includes("\\")) {
      errors.push({
        code: ValidationErrorCode.POTENTIALLY_MALICIOUS,
        message: "File name contains path traversal characters",
        field: "fileName",
      });
    }

    // Check file name length
    if (name.length > 255) {
      errors.push({
        code: ValidationErrorCode.INVALID_NAME,
        message: "File name is too long (maximum 255 characters)",
        field: "fileName",
      });
    }
  }

  /**
   * Validate file size
   */
  private validateFileSize(
    fileInfo: FileInfo,
    errors: FileValidationError[]
  ): void {
    const { size } = fileInfo;

    if (size === 0) {
      errors.push({
        code: ValidationErrorCode.FILE_TOO_SMALL,
        message: "File is empty",
        field: "fileSize",
      });
      return;
    }

    if (size > this.config.maxFileSize) {
      const maxSizeMB = Math.round(this.config.maxFileSize / (1024 * 1024));
      const fileSizeMB = Math.round(size / (1024 * 1024));
      errors.push({
        code: ValidationErrorCode.FILE_TOO_LARGE,
        message: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
        field: "fileSize",
      });
    }
  }

  /**
   * Validate file format
   */
  private validateFileFormat(
    fileInfo: FileInfo,
    errors: FileValidationError[]
  ): void {
    const { extension } = fileInfo;

    if (!extension) {
      errors.push({
        code: ValidationErrorCode.INVALID_FORMAT,
        message: "File must have a valid extension",
        field: "fileFormat",
      });
      return;
    }

    if (!this.config.allowedFormats.includes(extension.toLowerCase())) {
      errors.push({
        code: ValidationErrorCode.INVALID_FORMAT,
        message: `File format '${extension}' is not allowed. Allowed formats: ${this.config.allowedFormats.join(
          ", "
        )}`,
        field: "fileFormat",
      });
    }
  }

  /**
   * Validate content type matches file extension
   */
  private validateContentType(
    fileInfo: FileInfo,
    errors: FileValidationError[],
    warnings: string[]
  ): void {
    if (!this.config.requireContentTypeMatch) return;

    const { extension, detectedMimeType, type } = fileInfo;
    const expectedMimeTypes = this.getExpectedMimeTypes(extension);

    if (expectedMimeTypes.length === 0) return;

    // Check detected MIME type
    if (!expectedMimeTypes.includes(detectedMimeType)) {
      if (detectedMimeType === "application/octet-stream") {
        warnings.push("Could not determine file type from content");
      } else {
        errors.push({
          code: ValidationErrorCode.CONTENT_TYPE_MISMATCH,
          message: `File content (${detectedMimeType}) does not match extension (${extension})`,
          field: "contentType",
        });
      }
    }

    // Check browser-provided MIME type if available
    if (
      type &&
      !expectedMimeTypes.includes(type) &&
      type !== "application/octet-stream"
    ) {
      warnings.push(
        `Browser-reported MIME type (${type}) may not match file extension`
      );
    }
  }

  /**
   * Validate security aspects
   */
  private validateSecurity(
    fileInfo: FileInfo,
    errors: FileValidationError[],
    warnings: string[]
  ): void {
    const { name, isExecutable, hasMultipleExtensions } = fileInfo;

    // Check for executable files
    if (isExecutable) {
      errors.push({
        code: ValidationErrorCode.EXECUTABLE_FILE,
        message: "Executable files are not allowed",
        field: "security",
      });
    }

    // Check for multiple extensions (potential disguise attempt)
    if (hasMultipleExtensions) {
      warnings.push(
        "File has multiple extensions, which may indicate a disguised file type"
      );
    }

    // Check for suspicious patterns in filename
    const suspiciousPatterns = [
      /\.(scr|pif|com|bat|cmd|exe|vbs|js|jar)$/i,
      /\.(php|asp|jsp|cgi)$/i,
      /script/i,
      /payload/i,
    ];

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(name)) {
        errors.push({
          code: ValidationErrorCode.POTENTIALLY_MALICIOUS,
          message: "File name contains suspicious patterns",
          field: "security",
        });
        break;
      }
    }
  }

  /**
   * Perform security scanning (basic implementation)
   */
  private async performSecurityScan(
    file: File | Buffer,
    fileInfo: FileInfo
  ): Promise<SecurityScanResult> {
    const startTime = Date.now();
    const threats: ThreatInfo[] = [];

    try {
      const fileBuffer =
        file instanceof File ? Buffer.from(await file.arrayBuffer()) : file;

      // Basic signature-based detection
      const signatures = await this.scanForKnownSignatures(fileBuffer);
      threats.push(...signatures);

      // Content analysis
      const contentThreats = await this.analyzeFileContent(
        fileBuffer,
        fileInfo
      );
      threats.push(...contentThreats);

      const scanDuration = Date.now() - startTime;

      return {
        isClean: threats.length === 0,
        threats,
        scanDate: new Date(),
        scanDuration,
        scanEngine: "BasicScanner v1.0",
      };
    } catch (error) {
      console.error("Security scan error:", error);
      return {
        isClean: false,
        threats: [
          {
            type: ThreatType.SUSPICIOUS_CONTENT,
            name: "ScanError",
            severity: ThreatSeverity.MEDIUM,
            description: "Security scan failed",
          },
        ],
        scanDate: new Date(),
        scanDuration: Date.now() - startTime,
        scanEngine: "BasicScanner v1.0",
      };
    }
  }

  /**
   * Scan for known malicious signatures
   */
  private async scanForKnownSignatures(buffer: Buffer): Promise<ThreatInfo[]> {
    const threats: ThreatInfo[] = [];

    // Known malicious signatures (simplified examples)
    const signatures = [
      {
        pattern: Buffer.from("X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR"),
        name: "EICAR-Test-File",
      },
      { pattern: Buffer.from("MZ"), name: "PE-Executable", offset: 0 },
    ];

    for (const sig of signatures) {
      const offset = sig.offset || 0;
      if (buffer.length > offset + sig.pattern.length) {
        const slice = buffer.slice(offset, offset + sig.pattern.length);
        if (slice.equals(sig.pattern)) {
          threats.push({
            type: ThreatType.VIRUS,
            name: sig.name,
            severity: ThreatSeverity.HIGH,
            description: `Known malicious signature detected: ${sig.name}`,
          });
        }
      }
    }

    return threats;
  }

  /**
   * Analyze file content for suspicious patterns
   */
  private async analyzeFileContent(
    buffer: Buffer,
    fileInfo: FileInfo
  ): Promise<ThreatInfo[]> {
    const threats: ThreatInfo[] = [];
    const content = buffer.toString("utf8", 0, Math.min(buffer.length, 8192)); // First 8KB

    // Check for suspicious scripts in documents
    const scriptPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /vbscript:/i,
      /on\w+\s*=/i, // Event handlers
      /eval\s*\(/i,
      /document\.write/i,
    ];

    for (const pattern of scriptPatterns) {
      if (pattern.test(content)) {
        threats.push({
          type: ThreatType.SUSPICIOUS_CONTENT,
          name: "EmbeddedScript",
          severity: ThreatSeverity.MEDIUM,
          description: "File contains embedded script content",
        });
        break;
      }
    }

    // Check for suspicious URLs
    const urlPattern = /https?:\/\/[^\s<>"']+/gi;
    const urls = content.match(urlPattern) || [];

    for (const url of urls) {
      if (this.isSuspiciousUrl(url)) {
        threats.push({
          type: ThreatType.PHISHING,
          name: "SuspiciousURL",
          severity: ThreatSeverity.MEDIUM,
          description: `Suspicious URL detected: ${url}`,
        });
      }
    }

    return threats;
  }

  // Helper methods

  private extractFileExtension(fileName: string): string {
    const parts = fileName.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
  }

  private hasMultipleExtensions(fileName: string): boolean {
    const parts = fileName.split(".");
    return parts.length > 2;
  }

  private isExecutableFile(fileName: string): boolean {
    const executableExtensions = [
      "exe",
      "bat",
      "cmd",
      "com",
      "scr",
      "pif",
      "vbs",
      "js",
      "jar",
      "app",
      "deb",
      "pkg",
      "dmg",
      "run",
      "bin",
      "msi",
      "gadget",
    ];
    const extension = this.extractFileExtension(fileName);
    return executableExtensions.includes(extension);
  }

  private async detectMimeType(buffer: Buffer): Promise<string> {
    // Enhanced MIME type detection
    const header = buffer.slice(0, 16);

    // PDF
    if (header.slice(0, 4).toString() === "%PDF") {
      return "application/pdf";
    }

    // JPEG
    if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
      return "image/jpeg";
    }

    // PNG
    if (
      header
        .slice(0, 8)
        .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
    ) {
      return "image/png";
    }

    // GIF
    if (
      header.slice(0, 6).toString() === "GIF87a" ||
      header.slice(0, 6).toString() === "GIF89a"
    ) {
      return "image/gif";
    }

    // MP4
    if (header.slice(4, 8).toString() === "ftyp") {
      return "video/mp4";
    }

    // ZIP-based formats (DOCX, etc.)
    if (header[0] === 0x50 && header[1] === 0x4b) {
      // Could be DOCX, XLSX, etc.
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    }

    // Legacy DOC
    if (
      header
        .slice(0, 8)
        .equals(Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]))
    ) {
      return "application/msword";
    }

    // AVI
    if (
      header.slice(0, 4).toString() === "RIFF" &&
      header.slice(8, 12).toString() === "AVI "
    ) {
      return "video/x-msvideo";
    }

    return "application/octet-stream";
  }

  private getExpectedMimeTypes(extension: string): string[] {
    const mimeTypeMap: Record<string, string[]> = {
      pdf: ["application/pdf"],
      doc: ["application/msword"],
      docx: [
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      jpg: ["image/jpeg"],
      jpeg: ["image/jpeg"],
      png: ["image/png"],
      gif: ["image/gif"],
      mp4: ["video/mp4"],
      mov: ["video/quicktime"],
      avi: ["video/x-msvideo", "video/avi"],
    };

    return mimeTypeMap[extension.toLowerCase()] || [];
  }

  private isSuspiciousUrl(url: string): boolean {
    const suspiciousDomains = [
      "bit.ly",
      "tinyurl.com",
      "goo.gl",
      "t.co", // URL shorteners
      "tempmail",
      "guerrillamail",
      "10minutemail", // Temporary email services
    ];

    const suspiciousPatterns = [
      /\d+\.\d+\.\d+\.\d+/, // IP addresses
      /[a-z0-9]{20,}\./, // Long random subdomains
      /phishing|malware|virus/i,
    ];

    return (
      suspiciousDomains.some((domain) => url.includes(domain)) ||
      suspiciousPatterns.some((pattern) => pattern.test(url))
    );
  }
}

// Export utility functions
export function createDocumentValidator(): FileValidator {
  return new FileValidator({
    allowedFormats: ASSIGNMENT_FILE_CONFIGS.DOCUMENTS.formats,
    maxFileSize: ASSIGNMENT_FILE_CONFIGS.DOCUMENTS.maxSize,
  });
}

export function createVideoValidator(): FileValidator {
  return new FileValidator({
    allowedFormats: ASSIGNMENT_FILE_CONFIGS.VIDEOS.formats,
    maxFileSize: ASSIGNMENT_FILE_CONFIGS.VIDEOS.maxSize,
  });
}

export function createImageValidator(): FileValidator {
  return new FileValidator({
    allowedFormats: ASSIGNMENT_FILE_CONFIGS.IMAGES.formats,
    maxFileSize: ASSIGNMENT_FILE_CONFIGS.IMAGES.maxSize,
  });
}

export function createAssignmentValidator(
  allowedFormats: string[],
  maxFileSize: number
): FileValidator {
  return new FileValidator({
    allowedFormats,
    maxFileSize,
    maxFiles: 10, // Default max files for assignments
  });
}

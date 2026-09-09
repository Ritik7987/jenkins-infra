import React, { useRef, useState } from "react";
import { Modal, Button, Text } from "@mantine/core";
import { UploadCloud, FileText } from "lucide-react";
import { UploadDocumentDocument } from "../../../generated/graphql";
import classes from "./Documents.module.scss";
import { useMutation } from "@apollo/client/react";

interface UploadModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ opened, onClose, onSuccess }: UploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadDocument, { loading }] = useMutation(UploadDocumentDocument,{
    onCompleted: () => {
      onSuccess();
      handleClose();
    },
    onError: (err) => {
      setError(err.message || "Failed to upload document");
    },
  });

  const handleClose = () => {
    setFile(null);
    setError("");
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size or type if needed. Assuming 10MB limit based on wireframe
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size must be under 10MB");
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  const handleUpload = () => {
    if (!file) {
      setError("Please select a file first");
      return;
    }
    uploadDocument({ variables: { file } });
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Upload Document"
      centered
      radius="md"
      padding="lg"
    >
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
        accept=".pdf,application/pdf"
      />
      <div
        className={`${classes.uploadArea} ${file ? classes.hasFile : ""}`}
        onClick={() => fileInputRef.current?.click()}
      >
        {file ? (
          <>
            <FileText size={32} className={classes.uploadIcon} color="var(--success)" />
            <Text className={classes.uploadLabel}>{file.name}</Text>
            <Text className={classes.uploadSubtext}>
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          </>
        ) : (
          <>
            <UploadCloud size={32} className={classes.uploadIcon} />
            <Text className={classes.uploadLabel}>
              Click to upload or drag and drop
            </Text>
            <Text className={classes.uploadSubtext}>
              PDF up to 10MB
            </Text>
          </>
        )}
      </div>

      {error && <div className={classes.uploadError}>{error}</div>}

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
        <Button variant="default" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          color="indigo"
          onClick={handleUpload}
          loading={loading}
          disabled={!file}
        >
          Upload
        </Button>
      </div>
    </Modal>
  );
}

"use client";

import React, { useState } from "react";
import { Upload, Trash2, RefreshCw, Eye } from "lucide-react";
import { Modal, Button, Text, Group } from "@mantine/core";
import { FTable, ColumnDef } from "../../../ui/FTable/FTable";
import {
  GetDocumentsDocument,
  DeleteDocumentDocument,
  GetDocumentsQuery,
  DocumentStatusUpdatedDocument,
  ReprocessDocumentDocument,
} from "../../../generated/graphql";

type UploadedDoc = GetDocumentsQuery["documents"]["items"][0];
import { UploadModal } from "./UploadModal";
import classes from "./Documents.module.scss";
import { useMutation, useQuery, useSubscription } from "@apollo/client/react";

export default function DocumentsPage() {
  const [modalOpened, setModalOpened] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
  const [activePage, setActivePage] = useState(1);
  
  const { data, loading, refetch } = useQuery(GetDocumentsDocument, {
    variables: { pagination: { page: activePage, limit: 10 } },
    fetchPolicy: "cache-and-network",
  });
  
  const [deleteDocument, { loading: isDeleting }] = useMutation(DeleteDocumentDocument);
  const [reprocessDocument] = useMutation(ReprocessDocumentDocument);

  useSubscription(DocumentStatusUpdatedDocument, {
    onData: () => {
      // Refetch the data when a document's status updates via WebSocket
      refetch();
    },
  });

  const handleDelete = (id: string) => {
    setDocumentToDelete(id);
  };

  const confirmDelete = async () => {
    if (documentToDelete) {
      await deleteDocument({ variables: { id: documentToDelete } });
      setDocumentToDelete(null);
      refetch();
    }
  };

  const handleReprocess = async (id: string) => {
    await reprocessDocument({ variables: { id } });
    refetch();
  };

  const getStatusClass = (status: string) => {
    switch (status.toUpperCase()) {
      case "COMPLETED":
      case "READY":
        return classes.ready;
      case "PROCESSING":
        return classes.processing;
      case "FAILED":
        return classes.failed;
      default:
        return classes.pending;
    }
  };

  const columns: ColumnDef<UploadedDoc>[] = [
    {
      key: "filename",
      label: "Document",
    },
    {
      key: "pages",
      label: "Pages",
    },
    {
      key: "status",
      label: "Status",
      render: (doc) => (
        <span
          className={`${classes.statusBadge} ${getStatusClass(doc.status)}`}
        >
          {doc.status}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (doc) => new Date(doc.createdAt as string).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "Actions",
      render: (doc) => (
        <div style={{ display: "flex", gap: "8px" }}>
          {doc.status === "FAILED" && (
            <button
              className={classes.actionBtn}
              onClick={() => handleReprocess(doc._id)}
              title="Reprocess Document"
            >
              <RefreshCw size={16} />
            </button>
          )}
          <button
            className={classes.actionBtn}
            onClick={() => window.open(doc.fileUrl, '_blank')}
            title="View Document"
          >
            <Eye size={16} />
          </button>
          <button
            className={classes.actionBtn}
            onClick={() => handleDelete(doc._id)}
            title="Delete Document"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={classes.documentsContainer}>
      <div className={classes.header}>
        <h1 className={classes.title}>Manage Documents</h1>
        <button
          className={classes.uploadBtn}
          onClick={() => setModalOpened(true)}
        >
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      <FTable
        columns={columns}
        data={data?.documents?.items || []}
        loading={loading}
        noDataText="No documents found. Upload a document to get started."
        totalServerPages={data?.documents?.totalPages}
        activeServerPage={activePage}
        onPageChange={setActivePage}
      />

      <UploadModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={() => refetch()}
      />

      <Modal
        opened={!!documentToDelete}
        onClose={() => setDocumentToDelete(null)}
        title="Confirm Deletion"
        centered
        radius="md"
        padding="lg"
      >
        <Text size="sm" mb="xl">
          Are you sure you want to delete this document? This action cannot be undone.
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setDocumentToDelete(null)}>
            Cancel
          </Button>
          <Button color="red" onClick={confirmDelete} loading={isDeleting}>
            Delete Document
          </Button>
        </Group>
      </Modal>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { Modal, Button, Checkbox, Stack, Text, Group, ScrollArea, Loader, Center } from "@mantine/core";
import { useQuery, useMutation } from "@apollo/client/react";
import { GetDocumentsDocument, UpdateChatDocument, GetChatSessionDocument } from "@/generated/graphql";
import { notifications } from "@mantine/notifications";

interface DocumentSelectModalProps {
  opened: boolean;
  onClose: () => void;
  chatId: string;
  currentDocumentIds: string[];
}

export function DocumentSelectModal({ opened, onClose, chatId, currentDocumentIds }: DocumentSelectModalProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>(currentDocumentIds || []);
  const [prevOpened, setPrevOpened] = useState(opened);

  if (opened !== prevOpened) {
    setPrevOpened(opened);
    if (opened) {
      setSelectedDocs(currentDocumentIds || []);
    }
  }

  const { data, loading } = useQuery(GetDocumentsDocument, {
    variables: { pagination: { page: 1, limit: 50 } },
    skip: !opened,
  });

  const [updateChat, { loading: updating }] = useMutation(UpdateChatDocument, {
    onCompleted: () => {
      notifications.show({
        title: "Success",
        message: "Document context updated successfully",
        color: "green",
      });
      onClose();
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
    refetchQueries: [{ query: GetChatSessionDocument, variables: { id: chatId } }],
  });

  const handleUpdate = () => {
    updateChat({
      variables: {
        input: {
          chatId,
          documentIds: selectedDocs,
        },
      },
    });
  };

  const handleToggleDoc = (id: string) => {
    setSelectedDocs((prev) =>
      prev.includes(id) ? prev.filter((docId) => docId !== id) : [...prev, id]
    );
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Update Chat Context" centered>
      <Stack>
        <div>
          <Text size="sm" fw={500} mb={8}>
            Select Documents for this Chat
          </Text>
          <ScrollArea h={200} type="always" offsetScrollbars style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-sm)", padding: "10px" }}>
            {loading ? (
              <Center p="md">
                <Loader size="sm" />
              </Center>
            ) : data?.documents.items.length === 0 ? (
              <Text c="dimmed" size="sm" ta="center" py="md">
                No documents found. Please upload documents from the sidebar.
              </Text>
            ) : (
              <Stack gap="xs">
                {data?.documents.items.map((doc) => (
                  <Checkbox
                    key={doc._id}
                    label={doc.filename}
                    checked={selectedDocs.includes(doc._id)}
                    onChange={() => handleToggleDoc(doc._id)}
                  />
                ))}
              </Stack>
            )}
          </ScrollArea>
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} loading={updating} color="indigo" disabled={selectedDocs.length === 0}>
            Save
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

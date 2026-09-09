import React, { useState } from "react";
import {
  Modal,
  Button,
  TextInput,
  Checkbox,
  Stack,
  Text,
  Group,
  ScrollArea,
  Loader,
  Center,
} from "@mantine/core";
import { useQuery, useMutation } from "@apollo/client/react";
import { GetDocumentsDocument, CreateChatDocument, GetChatSessionsDocument } from "@/generated/graphql";
import { useRouter } from "next/navigation";
import { notifications } from "@mantine/notifications";

interface NewChatModalProps {
  opened: boolean;
  onClose: () => void;
}

export function NewChatModal({ opened, onClose }: NewChatModalProps) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [selectedDocs, setSelectedDocs] = useState<string[]>([]);

  const { data, loading } = useQuery(GetDocumentsDocument, {
    variables: { pagination: { page: 1, limit: 50 } },
    skip: !opened,
  });

  const [createChat, { loading: creating }] = useMutation(CreateChatDocument, {
    onCompleted: (data) => {
      notifications.show({
        title: "Success",
        message: "Chat created successfully",
        color: "green",
      });
      onClose();
      router.push(`/chat/${data.createChat._id}`);
      setTitle("");
      setSelectedDocs([]);
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
    refetchQueries: [GetChatSessionsDocument],
  });

  const handleCreate = () => {
    createChat({
      variables: {
        input: {
          title: title.trim() || undefined,
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
    <Modal opened={opened} onClose={onClose} title="Start New Chat" centered>
      <Stack>
        <TextInput
          label="Chat Title (Optional)"
          placeholder="New Chat"
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />

        <div>
          <Text size="sm" fw={500} mb={8}>
            Select Document Context
          </Text>
          <ScrollArea h={200} type="always" offsetScrollbars style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: "var(--mantine-radius-sm)", padding: "10px" }}>
            {loading ? (
              <Center p="md">
                <Loader size="sm" />
              </Center>
            ) : data?.documents.items.length === 0 ? (
              <Stack align="center" gap="xs" py="md">
                <Text c="dimmed" size="sm" ta="center">
                  No documents found
                </Text>
                <Button variant="light" size="xs" onClick={() => { onClose(); router.push('/documents'); }}>
                  Upload Document
                </Button>
              </Stack>
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
                <Button variant="light" size="xs" mt="sm" onClick={() => { onClose(); router.push('/documents'); }}>
                  Upload New Document
                </Button>
              </Stack>
            )}
          </ScrollArea>
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={creating} color="indigo" disabled={selectedDocs.length === 0}>
            Start Chat
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

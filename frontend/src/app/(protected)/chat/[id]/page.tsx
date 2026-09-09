"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import {
  GetChatSessionDocument,
  GetMessagesDocument,
  AskQuestionDocument,
  AnswerStreamDocument,
} from "@/generated/graphql";
import { useQuery, useMutation, useSubscription } from "@apollo/client/react";
import { Loader, Center, ActionIcon, Text, Textarea, Box, Title, Paper, Group, Badge, Stack, ThemeIcon } from "@mantine/core";
import { Send, Plus, Sparkles } from "lucide-react";
import styles from "./Chat.module.scss";
import { useDisclosure } from "@mantine/hooks";
import { DocumentSelectModal } from "@/components/documents/DocumentSelectModal";
import { notifications } from "@mantine/notifications";

export default function ChatPage() {
  const params = useParams();
  const sessionId = params.id as string;
  const bottomRef = useRef<HTMLDivElement>(null);
  const [docModalOpened, { open: openDocModal, close: closeDocModal }] = useDisclosure(false);
  const hasCheckedDocs = useRef(false);

  const { data: sessionData, loading: sessionLoading } = useQuery(GetChatSessionDocument, {
    variables: { id: sessionId },
  });

  const { data: messagesData, loading: messagesLoading } = useQuery(GetMessagesDocument, {
    variables: { sessionId },
    fetchPolicy: "network-only",
  });

  const [askQuestion, { loading: asking }] = useMutation(AskQuestionDocument);

  const [input, setInput] = useState("");
  const [localMessages, setLocalMessages] = useState<Array<{ _id: string; role: string; content: string }>>([]);
  const [streamingMessage, setStreamingMessage] = useState("");
  const [isWaiting, setIsWaiting] = useState(false);
  const [sources, setSources] = useState<Array<{ documentId: string; chunk: string; similarity: number }>>([]);

  const [prevMessagesData, setPrevMessagesData] = useState(messagesData);
  if (messagesData !== prevMessagesData) {
    setPrevMessagesData(messagesData);
    if (messagesData?.messages) {
      setLocalMessages(messagesData.messages);
    }
  }


  useEffect(() => {
    // Scroll to bottom whenever messages or streaming message changes
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages, streamingMessage]);

  useEffect(() => {
    if (sessionData?.chatSession && !hasCheckedDocs.current) {
      if (sessionData.chatSession.documentIds.length === 0) {
        openDocModal();
      }
      hasCheckedDocs.current = true;
    }
  }, [sessionData, openDocModal]);

  useSubscription(AnswerStreamDocument, {
    variables: { sessionId },
    onData: ({ data }) => {
      if (data.data?.answerStream) {
        setIsWaiting(false);
        setStreamingMessage((prev) => prev + data.data!.answerStream);
      }
    },
  });

  const handleSend = async () => {
    if (!input.trim() || asking) return;

    const question = input.trim();
    setInput("");

    // If there is an active streaming message, commit it to local messages
    if (streamingMessage) {
      setLocalMessages((prev) => [
        ...prev,
        { _id: `stream_${Date.now()}`, role: "ASSISTANT", content: streamingMessage },
      ]);
      setStreamingMessage("");
    }

    // Add user message locally
    setLocalMessages((prev) => [
      ...prev,
      { _id: `user_${Date.now()}`, role: "USER", content: question },
    ]);

    setIsWaiting(true);

    try {
      const res = await askQuestion({
        variables: {
          input: {
            sessionId,
            question,
          },
        },
      });
      if(res.data?.askQuestion?.sources) {
        setSources(res.data.askQuestion.sources);
      }
    } catch (err) {
      setIsWaiting(false);
      notifications.show({
        title: "Error",
        message: err instanceof Error ? err.message : "Failed to ask question",
        color: "red",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (sessionLoading || messagesLoading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  const session = sessionData?.chatSession;

  return (
    <div className={styles.mainContent}>
      <div className={styles.chatContainer}>
        <div className={styles.chatHeader}>
          <div className={styles.chatTitle}>{session?.title || "New Chat"}</div>
        </div>

        <div className={styles.chatArea}>
          {localMessages.length === 0 && !isWaiting && (
            <Center style={{ flex: 1 }}>
              <Stack align="center" gap="md">
                <ThemeIcon size={64} radius="xl" color="indigo" variant="light">
                  <Sparkles size={32} />
                </ThemeIcon>
                <Title order={3} c="dark.2">How can I help you today?</Title>
                <Text c="dimmed" size="sm" ta="center" maw={400}>
                  Ask questions about your uploaded documents. Make sure to select or upload a document to give me context.
                </Text>
              </Stack>
            </Center>
          )}

          {localMessages.map((msg) => (
            <Box
              key={msg._id}
              className={`${styles.message} ${
                msg.role === "USER"
                  ? styles.userMessage
                  : styles.assistantMessage
              }`}
            >
              <Text>{msg.content}</Text>
            </Box>
          ))}

          {isWaiting && !streamingMessage && (
            <Box className={`${styles.message} ${styles.assistantMessage}`}>
              <Loader color="gray" size="sm" type="dots" />
            </Box>
          )}

          {streamingMessage && (
            <Box className={`${styles.message} ${styles.assistantMessage}`}>
              <Text>
                {streamingMessage}
                <span style={{ marginLeft: 4, animation: "blink 1s step-end infinite" }}>
                  ▍
                </span>
              </Text>
            </Box>
          )}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputArea}>
          <Group align="flex-end" style={{ flex: 1, gap: '8px' }} wrap="nowrap">
            <ActionIcon
              onClick={openDocModal}
              size={56}
              radius="xl"
              variant="default"
              style={{ marginBottom: 2, border: 'none', backgroundColor: 'transparent' }}
            >
              <Plus size={24} color="var(--mantine-color-gray-6)" />
            </ActionIcon>
            <Textarea
              placeholder="Message Knowledge AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              minRows={1}
              maxRows={5}
              autosize
              size="md"
              radius="xl"
              style={{ flex: 1 }}
              styles={{
                input: { padding: '16px 24px' }
              }}
            />
            <ActionIcon
              onClick={handleSend}
              disabled={asking || !input.trim()}
              size={56}
              radius="xl"
              color="indigo"
              variant="filled"
              style={{ marginBottom: 2 }}
            >
              <Send size={24} />
            </ActionIcon>
          </Group>
        </div>
      </div>
      {sources.length > 0 && (
        <Box className={styles.sourcesPanel}>
          <Title order={3} className={styles.sourcesTitle}>Sources</Title>
          {sources.map((source, idx) => (
            <Paper key={idx+source.documentId} p="md" radius="md" mb="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text fw={600} size="sm" truncate style={{ maxWidth: '70%' }}>Document</Text>
                <Badge color="gray" variant="light" radius="xl">
                  {(source.similarity * 100).toFixed(0)}%
                </Badge>
              </Group>
              <Text size="sm" c="dimmed" lh={1.6}>
                {source.chunk}
              </Text>
            </Paper>
          ))}
        </Box>
      )}

      <DocumentSelectModal
        opened={docModalOpened}
        onClose={closeDocModal}
        chatId={sessionId}
        currentDocumentIds={session?.documentIds || []}
      />
    </div>
  );
}

"use client";

import React from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import {
  GetUserProfileDocument,
  UserLogoutDocument,
  GetChatSessionsDocument,
  GetDocumentsDocument,
} from "@/generated/graphql";
import {
  AppShell,
  Button,
  Center,
  Loader,
  Avatar,
  UnstyledButton,
  Group,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  Plus,
  MessageSquare,
  FileText,
  LayoutDashboard,
  Settings,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./ProtectedLayout.module.scss";
import { notifications } from "@mantine/notifications";
import { NewChatModal } from "@/components/chat/NewChatModal";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [opened] = useDisclosure();
  const [newChatOpened, { open: openNewChat, close: closeNewChat }] =
    useDisclosure(false);
  const pathname = usePathname();

  const { data, loading, error } = useQuery(GetUserProfileDocument, {
    fetchPolicy: "network-only",
  });

  const { data: chatData } = useQuery(GetChatSessionsDocument, {
    variables: { pagination: { limit: 20, page: 1 } },
  });

  const { data: docsData } = useQuery(GetDocumentsDocument, {
    variables: { pagination: { limit: 10, page: 1 } },
  });

  const [logoutUser, { loading: loadingLogout }] = useMutation(
    UserLogoutDocument,
    {
      onCompleted: () => {
        notifications.show({
          message: "User Logged out successfully",
          title: "Success",
          color: "green",
        });
      },
      refetchQueries: [GetUserProfileDocument],
    },
  );

  if (loading) {
    return (
      <Center style={{ height: "100vh" }}>
        <Loader size="lg" />
      </Center>
    );
  }

  if (error || !data?.getUserProfile) {
    return null;
  }

  const user = data.getUserProfile;
  const userInitials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user.email?.[0]?.toUpperCase() || "KA";

  const userName = user.name || "User";

  return (
    <AppShell
      navbar={{
        width: 260,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="0"
    >
      <AppShell.Navbar>
        <div className={styles.sidebar}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>KA</div>
            <div className={styles.logoText}>Knowledge AI</div>
          </div>

          <Button
            leftSection={<Plus size={16} />}
            fullWidth
            radius="md"
            color="indigo"
            className={styles.newChatBtn}
            onClick={openNewChat}
          >
            New Chat
          </Button>

          {/* <div className={styles.searchContainer}>
            <TextInput
              placeholder="Search..."
              leftSection={<Search size={16} />}
              radius="md"
              size="sm"
            />
          </div> */}

          <div className={styles.scrollSection}>
            <div className={styles.sectionTitle}>Recent Chats</div>
            {chatData?.chatSessions.items.map((chat) => (
              <Link
                href={`/chat/${chat._id}`}
                passHref
                key={chat._id}
                style={{ textDecoration: "none" }}
              >
                <UnstyledButton
                  w={"100%"}
                  className={`${styles.navItem} ${pathname === `/chat/${chat._id}` ? styles.active : ""}`}
                >
                  <div className={styles.itemIcon}>
                    <MessageSquare size={16} />
                  </div>
                  <span className={styles.itemText}>
                    {chat.title || "New Chat"}
                  </span>
                </UnstyledButton>
              </Link>
            ))}

            <Group justify="space-between" align="center" className={styles.sectionTitleGroup} mb={4} mt={16}>
              <div className={styles.sectionTitle} style={{ margin: 0 }}>Documents</div>
              <Tooltip label="Upload Document" position="right" withArrow>
                <Link href="/documents" passHref>
                  <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Upload Document">
                    <Plus size={14} />
                  </ActionIcon>
                </Link>
              </Tooltip>
            </Group>
            {docsData?.documents.items.map((doc) => (
              <Link
                href="/documents"
                passHref
                key={doc._id}
                style={{ textDecoration: "none" }}
              >
                <UnstyledButton
                  w="100%"
                  className={`${styles.navItem} ${pathname === "/documents" ? styles.active : ""}`}
                >
                  <div className={styles.itemIcon}>
                    <FileText size={16} />
                  </div>
                  <span className={styles.itemText}>{doc.filename}</span>
                </UnstyledButton>
              </Link>
            ))}

            <div className={styles.sectionTitle}>Dashboard</div>
            <Link href="/dashboard" passHref style={{ textDecoration: "none" }}>
              <UnstyledButton
                w={"100%"}
                className={`${styles.navItem} ${
                  pathname === "/dashboard" ? styles.active : ""
                }`}
              >
                <div className={styles.itemIcon}>
                  <LayoutDashboard size={16} />
                </div>
                <span className={styles.itemText}>Overview</span>
              </UnstyledButton>
            </Link>

            <div className={styles.sectionTitle}>Settings</div>
            <div className={styles.navItem}>
              <div className={styles.itemIcon}>
                <Settings size={16} />
              </div>
              <span className={styles.itemText}>Settings</span>
            </div>
          </div>

          <div className={styles.userProfile}>
            <Avatar color="indigo" radius="xl">
              {userInitials}
            </Avatar>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{userName}</span>
              <span className={styles.userEmail}>{user.email}</span>
            </div>
            <UnstyledButton
              onClick={() => logoutUser()}
              className={styles.logoutBtn}
              title="Logout"
              aria-label="Logout"
              disabled={loadingLogout}
            >
              <LogOut size={18} />
            </UnstyledButton>
          </div>
        </div>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>

      <NewChatModal opened={newChatOpened} onClose={closeNewChat} />
    </AppShell>
  );
}

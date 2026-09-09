"use client";

import React from "react";
import { Table, SimpleGrid } from "@mantine/core";
import styles from "./Dashboard.module.scss";

import { useQuery } from "@apollo/client/react";
import { GetDashboardDataDocument } from "../../../generated/graphql";
import { Loader, Center } from "@mantine/core";

export default function DashboardPage() {
  const { data, loading, error } = useQuery(GetDashboardDataDocument, {
    fetchPolicy: "cache-and-network",
  });

  if (loading && !data) {
    return (
      <Center h="100%">
        <Loader color="indigo" />
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100%">
        <div style={{ color: "red" }}>Error loading dashboard: {error.message}</div>
      </Center>
    );
  }

  const dashboardData = data?.getDashboardData;
  const statsData = dashboardData?.stats;

  const stats = [
    { label: "Total Chats", value: statsData?.totalChats || 0 },
    { label: "Active Documents", value: statsData?.activeDocuments || 0 },
    { label: "Total Pages Processed", value: statsData?.totalPages || 0 },
    { label: "Total Queries", value: statsData?.totalQueries || 0 },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <h1 className={styles.title}>Dashboard Overview</h1>
        <p className={styles.subtitle}>
          Analytics and insights for your document analysis
        </p>
      </div>

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="lg" className={styles.statsGrid}>
        {stats.map((stat, idx) => (
          <div key={idx + stat.label} className={styles.statCard}>
            <div className={styles.statValue}>{stat.value}</div>
            <div className={styles.statLabel}>{stat.label}</div>
          </div>
        ))}
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Recent Activity</h2>
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Chat</Table.Th>
                <Table.Th>Last Updated</Table.Th>
                <Table.Th>Messages</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {dashboardData?.recentActivities.map((row) => (
                <Table.Tr key={row._id}>
                  <Table.Td>{row.title || "New Chat"}</Table.Td>
                  <Table.Td>{new Date(row.updatedAt as string).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    <span className={`${styles.statusBadge} ${styles.ready}`}>
                      {row.messageCount} msgs
                    </span>
                  </Table.Td>
                </Table.Tr>
              ))}
              {(!dashboardData?.recentActivities || dashboardData.recentActivities.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={3} style={{ textAlign: 'center', color: 'gray' }}>No recent activity</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>

        <div className={styles.sectionCard}>
          <h2 className={styles.sectionTitle}>Top Documents</h2>
          <Table verticalSpacing="sm" horizontalSpacing="md">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Document</Table.Th>
                <Table.Th>Chats Used In</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {dashboardData?.topDocuments.map((row) => (
                <Table.Tr key={row._id}>
                  <Table.Td>{row.filename}</Table.Td>
                  <Table.Td>{row.chatCount}</Table.Td>
                </Table.Tr>
              ))}
              {(!dashboardData?.topDocuments || dashboardData.topDocuments.length === 0) && (
                <Table.Tr>
                  <Table.Td colSpan={2} style={{ textAlign: 'center', color: 'gray' }}>No documents found</Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </div>
      </SimpleGrid>
    </div>
  );
}
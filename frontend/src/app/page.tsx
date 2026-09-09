"use client";

import React, { useState } from "react";
import styles from "./page.module.css";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";


export default function Home() {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  return (
    <div className={styles.authLayout}>
      {/* LEFT PANEL */}
      <section className={styles.authBrand}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}></div>
          <div className={styles.logoText}>KnowledgeAI V2 UPGRADED</div>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            AI-Powered Document Intelligence
          </div>

          <h1>Chat with your documents using AI.</h1>

          <p>
            Upload PDFs, create knowledge workspaces, and get trustworthy
            answers grounded in your documents.
          </p>

          <div className={styles.previewCard}>
            <div className={styles.previewHeader}>
              <div>
                <div className={styles.previewTitle}>JWT Authentication</div>
                <div className={styles.previewSubtitle}>3 linked documents</div>
              </div>
            </div>

            <div className={styles.previewChat}>
              <div className={styles.userMsg}>
                What is JWT and how does it work?
              </div>
              <div className={styles.aiMsg}>
                JWT is a compact token format commonly used for authentication.
                It consists of a header, payload and signature.
              </div>
            </div>
          </div>

          <div className={styles.features}>
            <div className={styles.featurePill}>Multi-document Chat</div>
            <div className={styles.featurePill}>Source Citations</div>
            <div className={styles.featurePill}>PDF Processing</div>
            <div className={styles.featurePill}>Semantic Search</div>
          </div>
        </div>

        <div className={styles.footerTextLeft}>© 2026 KnowledgeAI</div>
      </section>

      {/* RIGHT PANEL */}
      <section className={styles.authPanel}>
        <div className={styles.authCard}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === "login" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`${styles.tab} ${activeTab === "signup" ? styles.tabActive : ""}`}
              onClick={() => setActiveTab("signup")}
              type="button"
            >
              Sign Up
            </button>
          </div>

          {/* LOGIN VIEW */}
          <div
            className={`${styles.view} ${activeTab === "login" ? styles.viewActive : ""}`}
          >
            <LoginForm onSwitchToSignup={() => setActiveTab("signup")} />
          </div>

          {/* SIGNUP VIEW */}
          <div
            className={`${styles.view} ${activeTab === "signup" ? styles.viewActive : ""}`}
          >
            <SignupForm onSwitchToLogin={() => setActiveTab("login")} />
          </div>
        </div>
      </section>
    </div>
  );
}

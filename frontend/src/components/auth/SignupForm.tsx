import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import { signupSchema } from "@/form/validations/signupSchema";
import { signupInitialValues } from "@/form/initial-values/signupValues";
import styles from "./AuthForms.module.scss";
import { FInput, FButton, FTypography } from "@/ui";
import { useMutation } from "@apollo/client/react";
import { UserSignUpDocument, UserGoogleAuthDocument } from "@/generated/graphql";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export default function SignupForm({
  onSwitchToLogin,
}: Readonly<{
  onSwitchToLogin: () => void;
}>) {
  const router = useRouter();
  const [signup, { loading }] = useMutation(UserSignUpDocument, {
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
    onCompleted: () => {
      notifications.show({
        title: "Success",
        message: "Successfully created account!",
        color: "green",
      });
      router.push("/dashboard");
    },
  });

  const [googleAuth, { loading: googleLoading }] = useMutation(UserGoogleAuthDocument, {
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: err.message,
        color: "red",
      });
    },
    onCompleted: () => {
      notifications.show({
        title: "Success",
        message: "Successfully logged in with Google",
        color: "green",
      });
      router.push("/dashboard");
    },
  });

  const signupForm = useForm({
    initialValues: signupInitialValues,
    validate: yupResolver(signupSchema),
  });

  const handleSignup = (values: typeof signupInitialValues) => {
    signup({
      variables: {
        input: {
          name: values.name,
          email: values.email,
          password: values.password,
        },
      },
    });
  };

  const renderStrengthMeter = () => {
    const val = signupForm.values.password || "";
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const strengthColors = [
      "#EF4444",
      "#F59E0B",
      "var(--mantine-color-primary-accent-filled, #4e65de)",
      "#10B981",
    ];
    const strengthLabels = [
      "Weak password",
      "Fair password",
      "Good password",
      "Strong password",
    ];

    const bars = [0, 1, 2, 3].map((i) => {
      const bg =
        i < score && val.length > 0
          ? strengthColors[Math.max(score - 1, 0)]
          : "var(--border)";
      return (
        <div
          key={i}
          className={styles.strengthBar}
          style={{ background: bg }}
        />
      );
    });

    const hint =
      val.length === 0
        ? "Use 8+ characters with a number and a symbol."
        : strengthLabels[Math.max(score - 1, 0)];

    return (
      <>
        <div className={styles.strengthMeter}>{bars}</div>
        <div className={styles.fieldHint}>{hint}</div>
      </>
    );
  };

  return (
    <>
      <FTypography variant="title">Create your account</FTypography>
      <FTypography variant="description">
        Start chatting with your documents and knowledge workspaces in minutes.
      </FTypography>

      <form
        className={styles.form}
        onSubmit={signupForm.onSubmit(handleSignup)}
      >
        <FInput
          label="Full name"
          type="text"
          placeholder="John Doe"
          error={signupForm.errors.name as string}
          {...signupForm.getInputProps("name")}
        />

        <FInput
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={signupForm.errors.email as string}
          {...signupForm.getInputProps("email")}
        />

        <div className={styles.field}>
          <FInput
            label="Password"
            type="password"
            placeholder="Create a password"
            error={signupForm.errors.password as string}
            {...signupForm.getInputProps("password")}
          />
          {renderStrengthMeter()}
        </div>

        <FButton type="submit" loading={loading}>
          Create Account
        </FButton>

        <div className={styles.divider}>
          <span>or continue with</span>
        </div>

        <div className={styles.socialRow} style={{ display: 'flex', justifyContent: 'center' }}>
          <GoogleLogin
            onSuccess={(credentialResponse) => {
              if (credentialResponse.credential) {
                googleAuth({ variables: { credential: credentialResponse.credential } });
              }
            }}
            onError={() => {
              notifications.show({ title: "Error", message: "Google Login Failed", color: "red" });
            }}
          />
        </div>
      </form>

      <div className={styles.footerText}>
        Already have an account?{" "}
        <button type="button" onClick={onSwitchToLogin}>
          Log in
        </button>
      </div>
    </>
  );
}

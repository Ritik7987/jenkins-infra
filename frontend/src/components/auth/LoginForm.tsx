import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useForm } from "@mantine/form";
import { yupResolver } from "mantine-form-yup-resolver";
import { loginSchema } from "@/form/validations/loginSchema";
import { loginInitialValues } from "@/form/initial-values/loginValues";
import styles from "./AuthForms.module.scss";
import { FInput, FButton, FTypography } from "@/ui";
import { useMutation } from "@apollo/client/react";
import { UserLoginDocument, UserGoogleAuthDocument } from "@/generated/graphql";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";

export default function LoginForm({
  onSwitchToSignup,
}: Readonly<{
  onSwitchToSignup: () => void;
}>) {
  const router = useRouter();
  const [login, { loading }] = useMutation(UserLoginDocument, {
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
        message: "Successfully logged in",
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

  const loginForm = useForm({
    initialValues: loginInitialValues,
    validate: yupResolver(loginSchema),
  });

  const handleLogin = (values: typeof loginInitialValues) => {
    login({
      variables: {
        input: {
          email: values.email,
          password: values.password,
        },
      },
    });
  };

  return (
    <>
      <FTypography variant="title">Welcome back</FTypography>
      <FTypography variant="description">
        Sign in to continue chatting with your documents and knowledge
        workspaces.
      </FTypography>

      <form className={styles.form} onSubmit={loginForm.onSubmit(handleLogin)}>
        <FInput
          label="Email"
          type="email"
          placeholder="john@example.com"
          error={loginForm.errors.email as string}
          {...loginForm.getInputProps("email")}
        />

        <FInput
          label="Password"
          type="password"
          placeholder="Enter password"
          error={loginForm.errors.password as string}
          {...loginForm.getInputProps("password")}
        />

        <div className={styles.row}>
          <label className={styles.checkbox}>
            <input type="checkbox" />
            {""}Remember me
          </label>

          <p className={styles.forgot}>Forgot password?</p>
        </div>

        <FButton type="submit" loading={loading}>
          Sign In
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
        Don&apos;t have an account?{" "}
        <button type="button" onClick={onSwitchToSignup}>
          Create account
        </button>
      </div>
    </>
  );
}
